import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";
import CodeHighlight from "@/components/CodeHighlight";
import PdfExportButton from "@/components/PdfExportButton";

const THUMB_ICONS: Record<number, string> = {
  1: "{ }",
  2: "< />",
  3: "[ ]",
  4: "# _",
  5: ">> _",
};

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

const BASE_URL = "https://devs-vltra.vercel.app";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Not Found" };
    return {
      title: post.title,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        url: `${BASE_URL}/posts/${slug}`,
        type: "article",
        publishedTime: post.date,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="animate-in">
      {/* Hero Banner */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: `var(--thumb-${post.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-20 text-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            목록으로
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-white/20 backdrop-blur-sm">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight max-w-3xl">
            {post.title}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mb-6">{post.description}</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <img src="/profile.svg" alt="profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />
              <div>
                <div className="text-white/90 font-medium text-sm">강건너물구경</div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <time dateTime={post.date}>{format(new Date(post.date), "yyyy.MM.dd")}</time>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
              >
                {tag}
              </span>
            ))}
            <span className="mx-1" />
            <PdfExportButton
              title={post.title}
              date={format(new Date(post.date), "yyyy.MM.dd")}
              category={post.category}
              tags={post.tags}
              author="강건너물구경"
            />
          </div>
        </div>
      </header>

      {/* Post Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <CodeHighlight />
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
