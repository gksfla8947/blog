"use client";

import { useEffect, useState } from "react";

export default function PostViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `post-viewed:${slug}`;
    const lastViewed = localStorage.getItem(key);
    // 오늘 이미 조회한 경우 GET, 처음이거나 날짜가 다르면 POST(+1)
    const method = lastViewed === today ? "GET" : "POST";

    fetch(`/api/posts/${slug}/views`, { method })
      .then((r) => r.json())
      .then((d) => {
        setViews(d.views);
        if (method === "POST") localStorage.setItem(key, today);
      })
      .catch(() => {});
  }, [slug]);

  return (
    <span className="flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views !== null ? views.toLocaleString() : "–"}
    </span>
  );
}
