"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import SignInButtons from "@/components/auth/SignInButtons";

type CommentFormProps = {
  session: Session | null;
  onSubmit: (content: string) => Promise<void>;
};

export default function CommentForm({ session, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const MAX = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } catch {
      setError("댓글 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── 비로그인 상태 ─────────────────────────────────────────────────────────
  if (!session) {
    return <SignInButtons message="댓글을 달려면 계정으로 로그인하세요" />;
  }

  // ── 로그인 상태 ───────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      {/* 로그인 유저 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "user"}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--card-border)]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--tag-bg)] text-[var(--accent)] flex items-center justify-center text-xs font-bold">
              {(session.user?.name ?? "?")[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-[var(--foreground)]">
            {session.user?.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          rows={3}
          maxLength={MAX}
          className="w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
        />

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${content.length > MAX * 0.9 ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}
            >
              {content.length} / {MAX}
            </span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "등록 중…" : "등록"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
