"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

type CommentData = {
  id: string;
  content: string;
  createdAt: string | null;
  user: { id: string; name: string | null; image: string | null };
};

export default function CommentSection({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [commentList, setCommentList] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/comments/${slug}`);
      if (!res.ok) throw new Error();
      setCommentList(await res.json());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (content: string) => {
    const res = await fetch(`/api/comments/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "댓글 등록 실패");
    }
    // 성공 시 목록 새로 고침
    await fetchComments();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/comments/${slug}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCommentList((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <section className="mt-16 border-t border-[var(--card-border)] pt-12">
      {/* 헤더 */}
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-2">
        댓글
        {!loading && commentList.length > 0 && (
          <span className="text-base font-normal text-[var(--muted)]">
            {commentList.length}개
          </span>
        )}
      </h2>

      {/* 댓글 목록 */}
      <div className="mb-8">
        {loading ? (
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 py-5 border-b border-[var(--card-border)]">
                <div className="w-9 h-9 rounded-full bg-[var(--card-border)] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-24 bg-[var(--card-border)] rounded animate-pulse" />
                  <div className="h-3 w-full bg-[var(--card-border)] rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-[var(--card-border)] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <p className="text-sm text-[var(--muted)]">
            댓글을 불러오지 못했습니다.{" "}
            <button
              onClick={fetchComments}
              className="underline hover:text-[var(--accent)] transition-colors"
            >
              다시 시도
            </button>
          </p>
        ) : commentList.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-4">
            첫 번째 댓글을 남겨보세요 ✍️
          </p>
        ) : (
          commentList.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={session?.user?.id}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 댓글 입력 */}
      <CommentForm session={session ?? null} onSubmit={handleSubmit} />
    </section>
  );
}
