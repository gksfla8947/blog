"use client";

import { useState, useRef, useCallback } from "react";
import PostCard from "./PostCard";
import Sidebar from "./Sidebar";
import type { Post } from "@/lib/posts";

interface PostListProps {
  posts: Post[];
  categories: { name: string; count: number }[];
}

export default function PostList({ posts, categories }: PostListProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const isFirstRender = useRef(true);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const handleCategoryChange = useCallback((cat: string) => {
    isFirstRender.current = false;
    // 카테고리 변경 시 리스트 영역 상단으로 부드럽게 스크롤
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }
    setActiveCategory(cat);
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
            <div
              className={`flex flex-col gap-4 ${isFirstRender.current ? "stagger-in" : "animate-fade"}`}
            >
              {filtered.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
