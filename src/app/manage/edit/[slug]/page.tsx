"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { updatePost } from "../../actions";
import TagInput from "@/components/editor/TagInput";
import CategoryInput from "@/components/editor/CategoryInput";
import PublishModal from "@/components/editor/PublishModal";
import { useDraft } from "@/hooks/useDraft";
import type { PostEditorRef } from "@/components/editor/PostEditor";

const PostEditor = dynamic(() => import("@/components/editor/PostEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] flex items-center justify-center text-gray-300">
      에디터 로딩 중...
    </div>
  ),
});

interface PostData {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: unknown[];
  contentHtml: string;
  published: boolean;
  date: string;
}

function formatSavedAt(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}에 임시저장됨`;
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const editorRef = useRef<PostEditorRef>(null);
  const [post, setPost] = useState<PostData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);

  const { save, scheduleSave, load, clear, savedAt, hasDraft } = useDraft(`edit:${slug}`);

  useEffect(() => {
    fetch("/api/manage/categories")
      .then((r) => r.json())
      .then((d) => setExistingCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/manage/posts/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Post not found");
        return r.json();
      })
      .then((data: { post: PostData }) => {
        const p = data.post;
        setPost(p);
        setTitle(p.title);
        setDescription(p.description ?? "");
        setCategory(p.category);
        setTags(p.tags ?? []);
        setPublished(p.published);
        setLoading(false);

        if (hasDraft) setShowRestoreBanner(true);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [slug, hasDraft]);

  function handleRestore() {
    const draft = load();
    if (!draft) return;
    setTitle(draft.title);
    setDescription(draft.description);
    setCategory(draft.category);
    setTags(draft.tags);
    if (draft.blocks.length > 0) {
      editorRef.current?.setBlocks(draft.blocks);
    }
    setShowRestoreBanner(false);
  }

  async function handleManualSave() {
    const blocks = editorRef.current?.getBlocks() ?? [];
    save({ title, slug, description, category, tags, blocks });
  }

  function handlePublishClick() {
    if (!title.trim()) { setError("제목을 입력하세요"); return; }
    if (!category.trim()) { setError("카테고리를 입력하세요"); return; }
    setError("");
    setShowPublish(true);
  }

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      const blocks = editorRef.current?.getBlocks() ?? [];
      const html = (await editorRef.current?.getHTML()) ?? "";
      const result = await updatePost(slug, {
        title: title.trim(),
        description: description.trim(),
        category,
        tags,
        content: blocks,
        contentHtml: html,
        published,
      });
      if (result.success) {
        clear();
        router.push("/manage");
      }
    } catch (e: any) {
      setError(e.message ?? "저장 실패");
      setShowPublish(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error || "포스트를 찾을 수 없습니다."}</p>
          <Link href="/manage" className="text-[var(--accent)]">← 관리자로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/manage" className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
            </svg>
          </Link>

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
              수정 완료
            </button>
          </div>
        </div>
      </header>

      {/* 임시저장 복원 배너 */}
      {showRestoreBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>
                저장된 임시본이 있습니다.{" "}
                {savedAt && <span className="font-medium">{formatSavedAt(savedAt)}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRestore}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                불러오기
              </button>
              <button
                onClick={() => { clear(); setShowRestoreBanner(false); }}
                className="px-3 py-1.5 text-xs rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
              >
                무시
              </button>
            </div>
          </div>
        </div>
      )}

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
          onChange={(e) => setTitle(e.target.value)}
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

        <PostEditor
          ref={editorRef}
          initialContent={Array.isArray(post.content) ? post.content : undefined}
          initialHtml={post.contentHtml ?? ""}
          postSlug={slug}
          onChange={(blocks) => scheduleSave({ title, slug, description, category, tags, blocks })}
        />
      </main>

      {showPublish && (
        <PublishModal
          title={title}
          slug={slug}
          description={description}
          published={published}
          onSlugChange={() => {}}
          onDescriptionChange={setDescription}
          onPublishedChange={setPublished}
          onConfirm={handleConfirm}
          onCancel={() => setShowPublish(false)}
          saving={saving}
          isEdit
        />
      )}
    </div>
  );
}
