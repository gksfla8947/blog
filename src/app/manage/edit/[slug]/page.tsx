"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { updatePost } from "../../actions";
import TagInput from "@/components/editor/TagInput";
import PublishModal from "@/components/editor/PublishModal";
import type { PostEditorRef } from "@/components/editor/PostEditor";

const PostEditor = dynamic(() => import("@/components/editor/PostEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] flex items-center justify-center text-gray-400">
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
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [slug]);

  function handlePublishClick() {
    if (!title.trim()) {
      setError("제목을 입력하세요");
      return;
    }
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
          <p className="text-gray-400 mb-4">
            {error || "포스트를 찾을 수 없습니다."}
          </p>
          <Link href="/manage" className="text-[var(--accent)]">
            ← 관리자로 돌아가기
          </Link>
        </div>
      </div>
    );
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
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Link>
          <button
            onClick={handlePublishClick}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            수정 완료
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
          onChange={(e) => setTitle(e.target.value)}
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
        <div className="mb-8 flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            카테고리
          </span>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="DEV"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>

        {/* Editor */}
        <PostEditor
          ref={editorRef}
          initialContent={Array.isArray(post.content) ? post.content : undefined}
          initialHtml={post.contentHtml ?? ""}
          postSlug={slug}
        />
      </main>

      {/* Publish Modal */}
      {showPublish && (
        <PublishModal
          title={title}
          slug={slug}
          description={description}
          published={published}
          onSlugChange={() => {}} // slug은 수정 불가
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
