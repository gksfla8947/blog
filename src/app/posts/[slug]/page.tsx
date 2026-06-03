import { notFound } from "next/navigation";
import { getAllPostsForBuild, getPostBySlug } from "@/lib/posts";
import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";
import CommentSection from "@/components/comments/CommentSection";
import PostViewCounter from "@/components/PostViewCounter";
import PostContent from "@/components/editor/PostContent";
import PostNavigation from "@/components/post/PostNavigation";
import AllPostsList from "@/components/post/AllPostsList";

const THUMB_ICONS: Record<number, string> = {
  1: "{ }",
  2: "< />",
  3: "[ ]",
  4: "# _",
  5: ">> _",
};

type Params = Promise<{ slug: string }>;

// ISR 안전망: revalidatePath 호출이 누락되거나 DB 직접 편집이 일어나도
// 최대 1시간 안에 PostNavigation·AllPostsList 가 갱신된다.
// 일반 흐름(글 작성/수정/삭제)은 actions.ts 의 revalidateAllPostPages 로 즉시 무효화됨.
export const revalidate = 3600;

export async function generateStaticParams() {
  // getAllPostsForBuild 가 DB flake 를 흡수해 빈 배열을 반환. Next.js 의
  // dynamicParams=true(기본값) 덕분에 슬러그 미등록 페이지는 첫 요청 시 동적
  // 렌더 후 캐시. 다음 빌드에서 DB 가 정상이면 SSG 가 자동 회복.
  const posts = await getAllPostsForBuild();
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

  // 빌드 캐시(getAllPostsForBuild → 내부 Map) 덕분에 DB 추가 호출 없음.
  // Neon flake 로 비어 있을 때도 nav/list 가 그냥 안 보일 뿐 페이지는 정상 렌더.
  const allPosts = await getAllPostsForBuild();

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
                  <PostViewCounter slug={slug} />
                </div>
              </div>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Post Content: 에디터와 동일한 BlockNote 스키마·컴포넌트를 읽기 전용으로 렌더.
          HTML→.prose 렌더 대신 에디터와 같은 컴포넌트를 써서 작성·읽기 모양을 완전히 일치시킨다. */}
      <div className="post-content-bg">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <PostContent blocks={post.blocks} />

          {/* 같은 카테고리 내 이전/다음 글 */}
          <PostNavigation
            currentSlug={slug}
            category={post.category}
            allPosts={allPosts}
          />

          {/* 전체 글 목록 (카테고리별 아코디언) */}
          <AllPostsList
            currentSlug={slug}
            currentCategory={post.category}
            allPosts={allPosts}
          />

          {/* 댓글 */}
          <CommentSection slug={slug} />
        </div>
      </div>
    </article>
  );
}
