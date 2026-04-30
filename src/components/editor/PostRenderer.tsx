"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { blocknoteSchema } from "./blocknote-schema";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface PostRendererProps {
  blocks: unknown[];
}

/**
 * 공개 포스트 뷰. 에디터(PostEditor)와 동일한 스키마·동일한 BlockNote 컴포넌트를
 * editable=false 로 사용해서 작성·읽기 모양이 완전히 동일하게 유지된다.
 */
export default function PostRenderer({ blocks }: PostRendererProps) {
  const initial = Array.isArray(blocks) && blocks.length > 0 ? blocks : undefined;
  const { resolvedTheme } = useTheme();

  const editor = useCreateBlockNote({
    schema: blocknoteSchema,
    initialContent: initial as any,
    // 에디터와 동일한 표 옵션을 켜야 헤더/병합/색상 속성이 동일한 스키마로 직렬화·역직렬화된다.
    tables: {
      headers: true,
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
    },
  });

  // BlockNote 내부가 브라우저 전용 API를 쓰므로 마운트 이후에만 렌더
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-[300px]" aria-hidden />;
  }

  return (
    <div className="blocknote-editor blocknote-readonly">
      <BlockNoteView
        editor={editor}
        editable={false}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        sideMenu={false}
        slashMenu={false}
        formattingToolbar={false}
        linkToolbar={false}
        filePanel={false}
        tableHandles={false}
      />
    </div>
  );
}
