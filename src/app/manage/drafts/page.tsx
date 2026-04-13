"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { draftStorage, type DraftItem } from "@/hooks/useDraft";

function formatDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);

  useEffect(() => {
    setDrafts(draftStorage.list());
  }, []);

  function handleDelete(id: string) {
    if (!confirm("임시글을 삭제하시겠습니까?")) return;
    draftStorage.delete(id);
    setDrafts(draftStorage.list());
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/manage" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              ← 관리자
            </Link>
            <h1 className="text-lg font-bold text-[var(--foreground)]">임시글 목록</h1>
          </div>
          <span className="text-sm text-[var(--muted)]">{drafts.length}개</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {drafts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] mb-4">저장된 임시글이 없습니다.</p>
            <Link
              href="/manage/new-post"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90"
            >
              새 글 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--foreground)] truncate">
                    {draft.title || <span className="text-[var(--muted)] font-normal italic">제목 없음</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                    {draft.category && <span>{draft.category}</span>}
                    {draft.category && <span>·</span>}
                    <span>{formatDate(draft.savedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => router.push(`/manage/new-post?draft=${draft.id}`)}
                    className="px-3 py-1.5 text-xs rounded-md border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
                  >
                    이어서 작성
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="px-3 py-1.5 text-xs rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
