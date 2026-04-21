"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

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
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
        <p className="text-sm text-[var(--muted)] mb-4">
          댓글을 달려면 Google 계정으로 로그인하세요
        </p>
        <button
          onClick={() => signIn("google")}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-white dark:bg-[#1e2a3a] border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors shadow-sm"
        >
          {/* Google 로고 SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Google로 로그인
        </button>
      </div>
    );
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
