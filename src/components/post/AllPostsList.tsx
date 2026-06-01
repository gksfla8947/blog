import Link from "next/link";
import { format } from "date-fns";
import type { Post } from "@/lib/posts";

interface AllPostsListProps {
  currentSlug: string;
  currentCategory: string;
  allPosts: Post[];
}

/**
 * 전체 글 목록 — 카테고리별 <details> 아코디언.
 *
 * 현재 글이 속한 카테고리만 펼친 상태(`open`)로 시작한다.
 * 클라이언트 JS 없이 순수 HTML 로 동작하므로 server component 그대로 사용.
 */
export default function AllPostsList({
  currentSlug,
  currentCategory,
  allPosts,
}: AllPostsListProps) {
  if (allPosts.length === 0) return null;

  const byCategory = new Map<string, Post[]>();
  for (const post of allPosts) {
    const list = byCategory.get(post.category);
    if (list) list.push(post);
    else byCategory.set(post.category, [post]);
  }
  const categories = Array.from(byCategory.keys()).sort();

  return (
    <section
      aria-label="전체 글 목록"
      className="mt-8 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
    >
      <h2 className="text-sm font-bold text-[var(--foreground)] mb-3">
        전체 글 ({allPosts.length})
      </h2>
      <div className="space-y-1">
        {categories.map((cat) => {
          const items = byCategory.get(cat)!;
          return (
            <details
              key={cat}
              open={cat === currentCategory}
              className="group rounded border border-transparent hover:border-[var(--card-border)] transition-colors"
            >
              <summary className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer list-none select-none rounded hover:bg-[var(--card-hover)]">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 text-[var(--muted)] group-open:rotate-90 transition-transform"
                    aria-hidden
                  >
                    ▶
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {cat}
                  </span>
                </span>
                <span className="text-xs text-[var(--muted)]">{items.length}</span>
              </summary>
              <ul className="pl-7 pr-2 py-1.5 space-y-0.5">
                {items.map((p) => {
                  const isCurrent = p.slug === currentSlug;
                  return (
                    <li key={p.slug}>
                      {isCurrent ? (
                        <span
                          aria-current="page"
                          className="flex items-baseline justify-between gap-3 px-2 py-1 rounded bg-[var(--accent-glow)] text-[var(--accent)] cursor-default"
                        >
                          <span className="text-xs font-semibold line-clamp-1">
                            {p.title}
                          </span>
                          <time
                            dateTime={p.date}
                            className="text-[10px] text-[var(--accent)] flex-shrink-0"
                          >
                            {format(new Date(p.date), "yy.MM.dd")}
                          </time>
                        </span>
                      ) : (
                        <Link
                          href={`/posts/${p.slug}`}
                          className="flex items-baseline justify-between gap-3 px-2 py-1 rounded hover:bg-[var(--card-hover)] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                        >
                          <span className="text-xs line-clamp-1">{p.title}</span>
                          <time
                            dateTime={p.date}
                            className="text-[10px] text-[var(--muted)] flex-shrink-0"
                          >
                            {format(new Date(p.date), "yy.MM.dd")}
                          </time>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
