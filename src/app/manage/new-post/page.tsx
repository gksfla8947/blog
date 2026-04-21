"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createPost } from "../actions";
import TagInput from "@/components/editor/TagInput";
import CategoryInput from "@/components/editor/CategoryInput";
import PublishModal from "@/components/editor/PublishModal";
import { draftStorage } from "@/hooks/useDraft";
import type { PostEditorRef } from "@/components/editor/PostEditor";

const PostEditor = dynamic(() => import("@/components/editor/PostEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] flex items-center justify-center text-gray-300">
      에디터 로딩 중...
    </div>
  ),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function formatSavedAt(ms: number): string {
  const date = new Date(ms);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}에 임시저장됨`;
}

function NewPostInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorRef = useRef<PostEditorRef>(null);

  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [initialBlocks, setInitialBlocks] = useState<unknown[] | undefined>(undefined);
  const [draftLoaded, setDraftLoaded] = useState(false);
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
  const [savedAt, setSavedAt] = useState<number | undefined>(undefined);
  const [hasContent, setHasContent] = useState(false);

  // Load categories
  useEffect(() => {
    fetch("/api/manage/categories")
      .then((r) => r.json())
      .then((d) => setExistingCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  // Load draft from URL param if present
  // draftLoaded가 true가 된 이후에만 PostEditor를 렌더링해서
  // initialContent가 확정된 상태로 에디터가 마운트되도록 함
  useEffect(() => {
    const id = searchParams.get("draft");
    if (!id) {
      setDraftLoaded(true);
      return;
    }
    const draft = draftStorage.get(id);
    if (!draft) {
      setDraftLoaded(true);
      return;
    }
    setDraftId(draft.id);
    setTitle(draft.title);
    setSlug(draft.slug ?? "");
    setSlugManual(!!(draft as any).slug);
    setDescription(draft.description);
    setCategory(draft.category);
    setTags(draft.tags);
    setSavedAt(draft.savedAt);
    if (draft.blocks.length > 0) {
      setInitialBlocks(draft.blocks);
    }
    setHasContent(true);
    setDraftLoaded(true);
  }, [searchParams]);

  // Track content changes
  function handleEditorChange(blocks: unknown[]) {
    const nonEmpty = blocks.some((b: any) => {
      if (b?.content?.length > 0) return true;
      if (b?.children?.length > 0) return true;
      return false;
    });
    setHasContent(nonEmpty || !!title.trim());
  }

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugManual) setSlug(slugify(val));
      if (val.trim()) setHasContent(true);
    },
    [slugManual]
  );

  // Manual save
  async function handleManualSave() {
    const blocks = editorRef.current?.getBlocks() ?? [];
    const id = draftStorage.save({ id: draftId, title, slug, description, category, tags, blocks });
    setDraftId(id);
    setSavedAt(Date.now());
  }

  // Back navigation prompt
  function handleBack(e: React.MouseEvent) {
    if (!hasContent && !title.trim()) return;
    e.preventDefault();
    const doSave = window.confirm("임시저장하시겠습니까?");
    if (doSave) {
      const blocks = editorRef.current?.getBlocks() ?? [];
      draftStorage.save({ id: draftId, title, slug, description, category, tags, blocks });
    }
    router.push("/manage");
  }

  function handlePublishClick() {
    if (!title.trim()) { setError("제목을 입력하세요"); return; }
    if (!category.trim()) { setError("카테고리를 입력하세요"); return; }
    setError("");
    setShowPublish(true);
  }

  async function handleConfirm() {
    if (!slug.trim()) { setError("슬러그를 입력하세요"); return; }
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
        if (draftId) draftStorage.delete(draftId);
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
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {formatSavedAt(savedAt)}
              </span>
            )}
            <button
              onClick={handleManualSave}
              className="px-4 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              임시저장
            </button>
            <button
              onClick={handlePublishClick}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              출간하기
            </button>
          </div>
        </div>
      </header>

      {/* Editor area */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full text-[2.5rem] font-extrabold text-gray-900 placeholder:text-gray-300 outline-none border-none bg-transparent leading-tight mb-2"
          autoFocus
        />

        <div className="w-16 h-[6px] rounded-full bg-gray-200 mb-5" />

        <div className="mb-8">
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div className="mb-8">
          <CategoryInput value={category} onChange={setCategory} existingCategories={existingCategories} />
        </div>

        {draftLoaded ? (
          <PostEditor
            ref={editorRef}
            initialContent={initialBlocks}
            postSlug={slug || undefined}
            onChange={handleEditorChange}
          />
        ) : (
          <div className="min-h-[500px] flex items-center justify-center text-gray-300">
            에디터 로딩 중...
          </div>
        )}
      </main>

      {showPublish && (
        <PublishModal
          title={title}
          slug={slug}
          description={description}
          published={published}
          onSlugChange={(s) => { setSlugManual(true); setSlug(s); }}
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

export default function NewPostPage() {
  return (
    <Suspense>
      <NewPostInner />
    </Suspense>
  );
}
