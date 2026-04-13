"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createPost } from "../actions";
import TagInput from "@/components/editor/TagInput";
import CategoryInput from "@/components/editor/CategoryInput";
import PublishModal from "@/components/editor/PublishModal";
import type { PostEditorRef } from "@/components/editor/PostEditor";

const PostEditor = dynamic(() => import("@/components/editor/PostEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] flex items-center justify-center text-[var(--muted)]">
      에디터 로딩 중...
    </div>
  ),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[가-힣]/g, (ch) => ch)
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
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/manage/categories")
      .then((r) => r.json())
      .then((d) => setExistingCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugManual) setSlug(slugify(val));
    },
    [slugManual]
  );

  function handlePublishClick() {
    if (!title.trim()) {
      setError("제목을 입력하세요");
      return;
    }
    setError("");
    setShowPublish(true);
  }

  async function handleConfirm() {
    if (!slug.trim()) {
      setError("슬러그를 입력하세요");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const blocks = editorRef.current?.getBlocks() ?? [];
      const html = (await editorRef.current?.getHTML()) ?? "";

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
      setShowPublish(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/manage"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
            </svg>
          </Link>
          <button
            onClick={handlePublishClick}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            출간하기
          </button>
        </div>
      </header>

      {/* Editor area */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full text-[2.5rem] font-extrabold text-gray-900 placeholder:text-gray-300 outline-none border-none bg-transparent leading-tight mb-2"
          autoFocus
        />

        {/* Divider */}
        <div className="w-16 h-[6px] rounded-full bg-gray-200 mb-5" />

        {/* Tags */}
        <div className="mb-8">
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Category */}
        <div className="mb-8">
          <CategoryInput
            value={category}
            onChange={setCategory}
            existingCategories={existingCategories}
          />
        </div>

        {/* Editor */}
        <PostEditor ref={editorRef} postSlug={slug || undefined} />
      </main>

      {/* Publish Modal */}
      {showPublish && (
        <PublishModal
          title={title}
          slug={slug}
          description={description}
          published={published}
          onSlugChange={(s) => {
            setSlugManual(true);
            setSlug(s);
          }}
          onDescriptionChange={setDescription}
          onPublishedChange={setPublished}
          onConfirm={handleConfirm}
          onCancel={() => setShowPublish(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
