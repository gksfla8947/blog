import Link from "next/link";
import type { Post } from "@/lib/posts";

interface PostNavigationProps {
  currentSlug: string;
  category: string;
  allPosts: Post[];
}

/**
 * 같은 카테고리 내 이전/다음 글 네비게이션.
 *
 * `allPosts` 는 `getAllPosts` 의 date desc 정렬을 그대로 받는다.
 * idx-1 = 더 최신 글 ("다음 글"), idx+1 = 더 오래된 글 ("이전 글").
 * 카테고리 경계에선 한쪽만 표시된다.
 */
export default function PostNavigation({
  currentSlug,
  category,
  allPosts,
}: PostNavigationProps) {
  const inCategory = allPosts.filter((p) => p.category === category);
  const idx = inCategory.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) return null;

  const newer = idx > 0 ? inCategory[idx - 1] : null;
  const older = idx < inCategory.length - 1 ? inCategory[idx + 1] : null;

  if (!newer && !older) return null;

  return (
    <nav
      aria-label="같은 카테고리 글 탐색"
      className="mt-16 pt-8 border-t border-[var(--card-border)]"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
        {category} 카테고리
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NavCard post={older} direction="prev" />
        <NavCard post={newer} direction="next" />
      </div>
    </nav>
  );
}

function NavCard({
  post,
  direction,
}: {
  post: Post | null;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  const label = isPrev ? "← 이전 글" : "다음 글 →";

  if (!post) {
    return <div className="hidden md:block" aria-hidden />;
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`group block rounded-lg border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent-light)] hover:bg-[var(--card-hover)] transition-colors p-4 ${
        isPrev ? "md:text-left" : "md:text-right"
      }`}
    >
      <div className="text-xs font-medium text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors mb-1.5">
        {label}
      </div>
      <div className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 leading-snug">
        {post.title}
      </div>
    </Link>
  );
}
