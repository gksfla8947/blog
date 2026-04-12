"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useCallback, useImperativeHandle, forwardRef } from "react";

interface PostEditorProps {
  initialContent?: unknown[];
  postSlug?: string;
  onChange?: (blocks: unknown[]) => void;
}

export interface PostEditorRef {
  getBlocks: () => unknown[];
  getHTML: () => Promise<string>;
}

const PostEditor = forwardRef<PostEditorRef, PostEditorProps>(
  function PostEditor({ initialContent, postSlug, onChange }, ref) {
    const editor = useCreateBlockNote({
      initialContent: initialContent as any,
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

    useImperativeHandle(ref, () => ({
      getBlocks: () => editor.document as unknown[],
      getHTML: async () => {
        try {
          return await editor.blocksToFullHTML(editor.document as any);
        } catch {
          // fallback
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
      <div className="blocknote-editor rounded-lg border border-[var(--card-border)] bg-white dark:bg-[#1a1a2e] min-h-[400px]">
        <BlockNoteView editor={editor} onChange={handleChange} theme="dark" />
      </div>
    );
  }
);

export default PostEditor;
