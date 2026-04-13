"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useCallback, useImperativeHandle, forwardRef, useEffect, useState } from "react";

interface PostEditorProps {
  initialContent?: unknown[];
  initialHtml?: string;
  postSlug?: string;
  onChange?: (blocks: unknown[]) => void;
}

export interface PostEditorRef {
  getBlocks: () => unknown[];
  getHTML: () => Promise<string>;
}

/** content JSON이 마이그레이션 placeholder인지 확인 */
function isPlaceholder(content?: unknown[]): boolean {
  if (!content || content.length === 0) return true;
  if (content.length === 1) {
    const block = content[0] as any;
    if (
      block?.type === "paragraph" &&
      Array.isArray(block?.content) &&
      block.content.length === 1 &&
      block.content[0]?.text?.startsWith("Migrated from MDX")
    ) {
      return true;
    }
  }
  return false;
}

const PostEditor = forwardRef<PostEditorRef, PostEditorProps>(
  function PostEditor({ initialContent, initialHtml, postSlug, onChange }, ref) {
    const [ready, setReady] = useState(false);

    const editor = useCreateBlockNote({
      uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        if (postSlug) formData.append("postSlug", postSlug);

        const res = await fetch("/api/manage/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      },
    });

    // 에디터 초기화: HTML fallback 또는 BlockNote JSON
    useEffect(() => {
      if (ready) return;

      async function init() {
        try {
          if (initialHtml && isPlaceholder(initialContent)) {
            // 마이그레이션된 포스트 — HTML에서 블록 변환
            const blocks = await editor.tryParseHTMLToBlocks(initialHtml);
            editor.replaceBlocks(editor.document, blocks);
          } else if (initialContent && !isPlaceholder(initialContent)) {
            // 정상 BlockNote JSON
            editor.replaceBlocks(editor.document, initialContent as any);
          }
        } catch (e) {
          console.error("Editor init error:", e);
        }
        setReady(true);
      }

      init();
    }, [editor, initialContent, initialHtml, ready]);

    useImperativeHandle(ref, () => ({
      getBlocks: () => editor.document as unknown[],
      getHTML: async () => {
        try {
          return await editor.blocksToFullHTML(editor.document as any);
        } catch {
          return "";
        }
      },
    }));

    const handleChange = useCallback(() => {
      if (onChange) {
        onChange(editor.document as unknown[]);
      }
    }, [editor, onChange]);

    return (
      <div className="blocknote-editor min-h-[500px]">
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
      </div>
    );
  }
);

export default PostEditor;
