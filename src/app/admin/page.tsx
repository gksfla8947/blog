"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("일반");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === toSlug(title)) {
      setSlug(toSlug(value));
    }
  };

  function toSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const handlePublish = async () => {
    if (!title || !content) {
      setMessage({ type: "error", text: "제목과 본문을 입력해주세요." });
      return;
    }

    setPublishing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, category, tags, content, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `발행 완료! Vercel 재배포 후 반영됩니다.` });
        setTitle("");
        setSlug("");
        setDescription("");
        setTags("");
        setContent("");
      } else {
        setMessage({ type: "error", text: data.error || "발행 실패" });
      }
    } catch {
      setMessage({ type: "error", text: "네트워크 오류" });
    } finally {
      setPublishing(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="sidebar-card w-full max-w-sm">
          <h2 className="text-lg font-bold mb-4 text-center">Admin Login</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password) setAuthenticated(true);
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="admin-input w-full mb-3"
            />
            <button type="submit" className="admin-btn-primary w-full">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-in">
      <h1 className="text-2xl font-bold mb-6 gradient-text">새 글 작성</h1>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="admin-label">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="글 제목"
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="admin-label">슬러그 (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-url-slug"
            className="admin-input w-full"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="admin-label">설명</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="글에 대한 간단한 설명"
          className="admin-input w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="admin-label">카테고리</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="카테고리"
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="admin-label">태그 (쉼표로 구분)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="JavaScript, React, ..."
            className="admin-input w-full"
          />
        </div>
      </div>

      {/* Editor tabs */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "write"
              ? "bg-[var(--card)] text-[var(--foreground)] border border-b-0 border-[var(--card-border)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          작성
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            tab === "preview"
              ? "bg-[var(--card)] text-[var(--foreground)] border border-b-0 border-[var(--card-border)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          미리보기
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="sidebar-card min-h-[400px] !rounded-tl-none">
        {tab === "write" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="마크다운으로 작성하세요..."
            className="w-full h-[400px] bg-transparent resize-y outline-none font-mono text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        ) : (
          <div className="prose prose-neutral dark:prose-invert max-w-none min-h-[400px]">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-[var(--muted)]">미리보기할 내용이 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* Publish button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="admin-btn-primary px-8"
        >
          {publishing ? "발행 중..." : "발행하기"}
        </button>
      </div>
    </div>
  );
}
