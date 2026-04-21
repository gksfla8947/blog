"use client";

import { useState, useRef, useCallback } from "react";
import PostCard from "./PostCard";
import Sidebar from "./Sidebar";
import Pagination from "./Pagination";
import type { Post } from "@/lib/posts";

interface PostListProps {
  posts: Post[];
  categories: { name: string; count: number }[];
  viewsMap?: Record<string, number>;
}

export default function PostList({ posts, categories, viewsMap }: PostListProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isFirstRender = useRef(true);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = posts.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const handleSearch = useCallback((value: string) => {
    isFirstRender.current = false;
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    isFirstRender.current = false;
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
    setActiveCategory(cat);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-[260px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <Sidebar
              categories={categories}
              totalPosts={posts.length}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0" ref={listRef}>
          {/* Search */}
          <div className="relative mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="제목, 설명, 태그로 검색..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
              {activeCategory === "All" ? "Recent Posts" : activeCategory}
            </h2>
            <span className="text-xs text-[var(--muted)]">{filtered.length}개의 글</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4 opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <p className="text-[var(--muted)]">아직 작성된 글이 없습니다.</p>
            </div>
          ) : (
            <>
              <div
                className={`flex flex-col gap-4 ${isFirstRender.current ? "stagger-in" : "animate-fade"}`}
              >
                {paged.map((post) => (
                  <PostCard key={post.slug} post={post} views={viewsMap?.[post.slug]} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
