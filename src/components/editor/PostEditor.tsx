"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
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
import { codeBlockOptions } from "@blocknote/code-block";
import { Callout } from "./CalloutBlock";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useCallback, useImperativeHandle, forwardRef, useEffect, useState } from "react";

const extendedCodeBlockOptions = {
  ...codeBlockOptions,
  supportedLanguages: {
    ...codeBlockOptions.supportedLanguages,
    dockerfile: {
      name: "Dockerfile",
      aliases: ["dockerfile", "docker"],
    },
  },
};

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec(extendedCodeBlockOptions),
    callout: Callout(),
  },
});

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

    const editor = useCreateBlockNote({
      schema,
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
    }));

    const handleChange = useCallback(() => {
      if (onChange) {
        onChange(editor.document as unknown[]);
      }
    }, [editor, onChange]);

    return (
      <div className="blocknote-editor min-h-[500px]">
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" slashMenu={false}>
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
