"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type CommentItemProps = {
  comment: {
    id: string;
    content: string;
    createdAt: string | null;
    user: { id: string; name: string | null; image: string | null };
  };
  currentUserId?: string;
  onDelete: (id: string) => Promise<void>;
};

export default function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: CommentItemProps) {
  const [deleting, setDeleting] = useState(false);
  const isOwner = currentUserId === comment.user.id;

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    await onDelete(comment.id);
    setDeleting(false);
  };

  return (
    <div className="flex gap-3 py-5 border-b border-[var(--card-border)] last:border-0">
      {/* 아바타 */}
      {comment.user.image ? (
        <img
          src={comment.user.image}
          alt={comment.user.name ?? "user"}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-[var(--card-border)]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-[var(--tag-bg)] text-[var(--accent)] font-bold text-sm">
          {(comment.user.name ?? "?")[0].toUpperCase()}
        </div>
      )}

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {comment.user.name ?? "익명"}
            </span>
            {comment.createdAt && (
              <time className="text-xs text-[var(--muted)]">
                {format(new Date(comment.createdAt), "yyyy.MM.dd HH:mm", {
                  locale: ko,
                })}
              </time>
            )}
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-[var(--muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {deleting ? "삭제 중…" : "삭제"}
            </button>
          )}
        </div>

        <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
