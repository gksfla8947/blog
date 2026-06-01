import { db } from "./db";
import { posts } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { withDbRetry } from "./db/retry";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category: string;
  content: string; // contentHtml (SEO/RSS 용 fallback)
  blocks: unknown[]; // BlockNote JSON — 포스트 화면 렌더의 1차 소스
  thumbnail: number;
  coverImage: string | null;
}

function slugToThumbnail(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 5) + 1;
}


function extractCoverImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * BlockNote HTML을 조회용으로 정리:
 * 1. JSON에서 코드 블록 언어 정보를 추출하여 <code>에 language-xxx 클래스 주입
 * 2. 에디터 전용 요소(<select>, contenteditable 등) 제거
 */
function cleanContentHtml(html: string, contentJson: unknown): string {
  if (!html) return html;

  // 에디터 전용 <select> 드롭다운 제거
  let cleaned = html.replace(/<div contenteditable="false"><select>[\s\S]*?<\/select><\/div>/g, "");

  // JSON에서 codeBlock 언어 정보 순서대로 추출
  const languages: string[] = [];
  function walk(blocks: unknown[]) {
    for (const block of blocks) {
      const b = block as Record<string, unknown>;
      if (b?.type === "codeBlock") {
        const props = b.props as Record<string, unknown> | undefined;
        languages.push((props?.language as string) || "text");
      }
      if (Array.isArray(b?.children)) walk(b.children as unknown[]);
    }
  }
  const blocks = Array.isArray(contentJson) ? contentJson : [];
  walk(blocks);

  // codeBlock의 <code> 태그에 language-xxx 클래스 주입
  let langIdx = 0;
  cleaned = cleaned.replace(
    /(<div[^>]*data-content-type="codeBlock"[^>]*><pre><code)([^>]*>)/g,
    (_match, before, after) => {
      const lang = languages[langIdx++] || "text";
      if (lang && lang !== "text") {
        return `${before} class="language-${lang}"${after.replace(/class="[^"]*"/, "")}`;
      }
      return `${before}${after}`;
    }
  );

  return cleaned;
}

function dbPostToPost(row: typeof posts.$inferSelect): Post {
  const rawHtml = row.contentHtml ?? "";
  const html = cleanContentHtml(rawHtml, row.content);
  return {
    slug: row.id,
    title: row.title,
    date: typeof row.date === "string" ? row.date : new Date(row.date).toISOString(),
    description: row.description ?? "",
    tags: row.tags ?? [],
    category: row.category,

    content: html,
    blocks: Array.isArray(row.content) ? (row.content as unknown[]) : [],
    thumbnail: slugToThumbnail(row.id),
    coverImage: extractCoverImage(html),
  };
}

/**
 * 빌드 프로세스 내 메모리 캐시.
 *
 * Vercel 의 Next.js SSG 는 `generateStaticParams` 가 슬러그 목록을 반환한 뒤
 * 페이지마다 다시 `getPostBySlug` 를 호출한다. 포스트 52개면 DB 호출 53회 —
 * Neon serverless 의 control-plane flake 가 그중 하나만 맞아도 빌드가 통째로
 * 죽는다. 첫 `getAllPosts` 결과를 그대로 캐싱하고 그 뒤의 `getPostBySlug`
 * 호출은 이 캐시에서 응답해 DB 호출을 1회로 줄인다.
 *
 * 런타임(서버 요청)에는 매 invocation 이 새 프로세스라 module-level 변수는
 * 자연스럽게 사라져 신선도 문제가 없다. 빌드(단일 워커 프로세스) 안에서만 의미.
 */
let _buildCacheBySlug: Map<string, Post> | null = null;

export async function getAllPosts(): Promise<Post[]> {
  // SSG 빌드에서 페이지당 60초 한도가 있어 hang 도 retry 대상으로 만든다.
  const rows = await withDbRetry(() =>
    db
      .select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.date)),
  );

  const list = rows.map(dbPostToPost);

  // 빌드 페이즈에서만 캐시 — 런타임에선 매 요청 신선한 데이터를 가져온다.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    _buildCacheBySlug = new Map(list.map((p) => [p.slug, p]));
  }

  return list;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // 빌드 중에는 generateStaticParams 가 미리 채워둔 캐시를 우선 사용.
  const cached = _buildCacheBySlug?.get(slug);
  if (cached) return cached;

  const rows = await withDbRetry(() =>
    db.select().from(posts).where(eq(posts.id, slug)).limit(1),
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  // Allow viewing even unpublished posts by direct slug
  return dbPostToPost(row);
}

export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const catSet = new Set<string>();
  allPosts.forEach((post) => catSet.add(post.category));
  return Array.from(catSet).sort();
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagSet = new Set<string>();
  allPosts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}
