"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createPost } from "../actions";
import type { PostEditorRef } from "@/components/editor/PostEditor";

const PostEditor = dynamic(
  () => import("@/components/editor/PostEditor"),
  { ssr: false, loading: () => <div className="min-h-[400px] rounded-lg border border-[var(--card-border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted)]">에디터 로딩 중...</div> }
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[가-힣]/g, (ch) => ch) // keep Korean
    .replace(/[^\w가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewPostPage() {
  const router = useRouter();
  const editorRef = useRef<PostEditorRef>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DEV");
  const [tagsInput, setTagsInput] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugManual) setSlug(slugify(val));
    },
    [slugManual]
  );

  async function handleSave() {
    if (!title.trim()) {
      setError("제목을 입력하세요");
      return;
    }
    if (!slug.trim()) {
      setError("슬러그를 입력하세요");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const blocks = editorRef.current?.getBlocks() ?? [];
      const html = (await editorRef.current?.getHTML()) ?? "";
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createPost({
        id: slug,
        title: title.trim(),
        date: new Date().toISOString(),
        description: description.trim(),
        category,
        tags,
        content: blocks,
        contentHtml: html,
        published,
      });

      if (result.success) {
        router.push("/manage");
      }
    } catch (e: any) {
      setError(e.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card)] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/manage"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← 관리자
            </Link>
            <h1 className="text-lg font-bold text-[var(--foreground)]">새 글 작성</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded"
              />
              공개
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Meta fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="제목"
              className="w-full px-4 py-3 text-2xl font-bold rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted)]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">슬러그 (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              placeholder="post-slug"
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="DEV"
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">설명</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="포스트 설명"
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Next.js, React, TypeScript"
              className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-2">내용</label>
          <PostEditor ref={editorRef} postSlug={slug || undefined} />
        </div>
      </main>
    </div>
  );
}
