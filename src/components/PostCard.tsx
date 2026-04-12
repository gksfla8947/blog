import Link from "next/link";
import { format } from "date-fns";
import type { Post } from "@/lib/posts";

const THUMB_ICONS: Record<number, string> = {
  1: "{ }",
  2: "< />",
  3: "[ ]",
  4: "# _",
  5: ">> _",
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card group">
      <Link href={`/posts/${post.slug}`} className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div
          className="thumb-gradient w-full sm:w-48 h-36 sm:h-auto flex items-center justify-center shrink-0 overflow-hidden"
          style={post.coverImage ? undefined : { background: `var(--thumb-${post.thumbnail})` }}
        >
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white/90 text-2xl font-mono font-bold select-none">
              {THUMB_ICONS[post.thumbnail] ?? "{ }"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-5 flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-[var(--accent-glow)] text-[var(--accent)]">
                {post.category}
              </span>
            </div>
            <h2 className="text-lg font-bold leading-snug mb-1.5 group-hover:text-[var(--accent)] transition-colors line-clamp-1">
              {post.title}
            </h2>
            <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
              {post.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--card-border)]">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-full border border-[var(--tag-border)] bg-[var(--tag-bg)] text-[var(--tag-text)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] shrink-0 ml-3">
              <time dateTime={post.date}>{format(new Date(post.date), "yyyy.MM.dd")}</time>
              <span className="w-1 h-1 rounded-full bg-[var(--muted)] opacity-40" />
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
