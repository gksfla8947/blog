"use client";

import dynamic from "next/dynamic";

// BlockNote가 SSR에서 브라우저 API를 건드려 깨지므로 ssr:false 로 dynamic import.
// 서버 컴포넌트(posts/[slug]/page.tsx)에서 직접 dynamic({ssr:false})을 쓸 수 없어
// 이 파일을 "use client" 래퍼로 둔다.
const PostRenderer = dynamic(() => import("./PostRenderer"), {
  ssr: false,
  loading: () => <div className="min-h-[300px]" aria-hidden />,
});

export default function PostContent({ blocks }: { blocks: unknown[] }) {
  return <PostRenderer blocks={blocks} />;
}
