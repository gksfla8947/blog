import Link from "next/link";
import { format } from "date-fns";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={`/posts/${post.slug}`} className="block py-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold group-hover:text-[var(--accent)] transition-colors">
            {post.title}
          </h2>
          <p className="text-[var(--muted)] text-sm line-clamp-2">{post.description}</p>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <time dateTime={post.date}>{format(new Date(post.date), "yyyy.MM.dd")}</time>
            <span>{post.readingTime}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-md bg-[var(--tag-bg)] text-[var(--tag-text)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
