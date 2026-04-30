"use client";

import { useCreateBlockNote } from "@blocknote/react";
import type { BlockNoteSchema } from "@blocknote/core";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useCallback, useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { blocknoteSchema as schema } from "./blocknote-schema";
import { useTheme } from "next-themes";

type EditorType = typeof schema extends BlockNoteSchema<infer B, infer I, infer S>
  ? Parameters<typeof getDefaultReactSlashMenuItems<B, I, S>>[0]
  : never;

const getCustomSlashMenuItems = (
  editor: EditorType
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  {
    title: "Callout",
    onItemClick: () => {
      insertOrUpdateBlockForSlashMenu(editor, {
        type: "callout" as any,
        props: { type: "info" },
      });
    },
    aliases: ["callout", "info", "warning", "note", "alert"],
    group: "Basic blocks",
    icon: <span style={{ fontSize: 18 }}>💡</span>,
    subtext: "Callout block for tips, warnings, and notes",
  },
];

interface PostEditorProps {
  initialContent?: unknown[];
  initialHtml?: string;
  postSlug?: string;
  onChange?: (blocks: unknown[]) => void;
}

export interface PostEditorRef {
  getBlocks: () => unknown[];
  getHTML: () => Promise<string>;
  setBlocks: (blocks: unknown[]) => void;
}

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
    const { resolvedTheme } = useTheme();

    const editor = useCreateBlockNote({
      schema,
      // 표 블록 고급 기능: 헤더 행/열 지정, 셀 합치기/분리, 셀 색상.
      // 셀 안에 다른 블록(제목·리스트 등)을 넣는 건 BlockNote 표 스키마의
      // 하드 제약(content: tableContent+ → inline*)으로 불가하다.
      tables: {
        headers: true,
        splitCells: true,
        cellBackgroundColor: true,
        cellTextColor: true,
      },
      uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        if (postSlug) formData.append("postSlug", postSlug);

        let res: Response;
        try {
          res = await fetch("/api/manage/upload", {
            method: "POST",
            body: formData,
          });
        } catch (e) {
          alert("이미지 업로드 실패: 네트워크 오류가 발생했습니다.");
          throw e;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.error ?? `업로드 실패 (${res.status})`;
          alert(`이미지 업로드 실패: ${msg}`);
          throw new Error(msg);
        }

        const data = await res.json();
        return data.url as string;
      },
    });

    useEffect(() => {
      if (ready) return;

      async function init() {
        try {
          if (initialHtml && isPlaceholder(initialContent)) {
            const blocks = await editor.tryParseHTMLToBlocks(initialHtml);
            editor.replaceBlocks(editor.document, blocks);
          } else if (initialContent && !isPlaceholder(initialContent)) {
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
      setBlocks: (blocks: unknown[]) => {
        editor.replaceBlocks(editor.document, blocks as any);
      },
    }));

    const handleChange = useCallback(() => {
      if (onChange) {
        onChange(editor.document as unknown[]);
      }
    }, [editor, onChange]);

    return (
      <div className="blocknote-editor min-h-[500px]">
        <BlockNoteView editor={editor} onChange={handleChange} theme={resolvedTheme === "dark" ? "dark" : "light"} slashMenu={false}>
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(getCustomSlashMenuItems(editor as any), query)
            }
          />
        </BlockNoteView>
      </div>
    );
  }
);

export default PostEditor;
