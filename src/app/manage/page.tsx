"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deletePost, togglePublish } from "./actions";
import Pagination from "@/components/Pagination";

interface PostRow {
  id: string;
  title: string;
  category: string;
  published: boolean;
  date: string;
}

export default function ManagePage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch("/api/manage/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`"${slug}" 포스트를 삭제하시겠습니까?`)) return;
    await deletePost(slug);
    setPosts((prev) => prev.filter((p) => p.id !== slug));
  }

  async function handleToggle(slug: string, current: boolean) {
    await togglePublish(slug, !current);
    setPosts((prev) =>
      prev.map((p) => (p.id === slug ? { ...p, published: !current } : p))
    );
  }

  const start = (page - 1) * pageSize;
  const paged = posts.slice(start, start + pageSize);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              ← 블로그
            </Link>
            <h1 className="text-lg font-bold text-[var(--foreground)]">관리자</h1>
          </div>
          <Link
            href="/manage/new-post"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            + 새 글 작성
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-[var(--muted)]">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] mb-4">작성된 글이 없습니다.</p>
            <Link
              href="/manage/new-post"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90"
            >
              첫 글 작성하기
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paged.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-colors"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      post.published ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    title={post.published ? "공개" : "비공개"}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1">
                      <span>{post.category}</span>
                      <span>·</span>
                      <span>{post.date?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(post.id, post.published)}
                      className="px-3 py-1.5 text-xs rounded-md border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
                    >
                      {post.published ? "비공개로" : "공개로"}
                    </button>
                    <Link
                      href={`/manage/edit/${post.id}`}
                      className="px-3 py-1.5 text-xs rounded-md border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1.5 text-xs rounded-md border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalItems={posts.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </main>
    </div>
  );
}
