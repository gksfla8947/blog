"use server";

import { db } from "@/lib/db";
import { posts, blobFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function assertAuth(authed: boolean) {
  if (!authed) throw new Error("Unauthorized");
}

/**
 * 모든 포스트 페이지의 캐시된 HTML 을 무효화.
 *
 * 글 작성·수정·삭제·공개 토글이 일어나면 기존 포스트 페이지 하단의
 * PostNavigation/AllPostsList 도 같이 갱신돼야 한다. 동적 라우트 패턴 +
 * type="page" 형태로 호출하면 매칭되는 모든 페이지가 다음 방문 시 재렌더된다.
 * (참조: next.js docs - revalidatePath/#revalidating-a-page-path)
 */
function revalidateAllPostPages(currentSlug?: string) {
  revalidatePath("/");
  revalidatePath("/posts/[slug]", "page");
  // 현재 글 자체도 즉시 무효화하면 admin 이 본인 변경을 새로고침 없이 즉시 확인 가능.
  if (currentSlug) revalidatePath(`/posts/${currentSlug}`);
}

export async function createPost(data: {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  tags: string[];
  content: unknown;
  contentHtml: string;
  published: boolean;
}) {
  assertAuth(await isAuthenticated());
  if (!data.category.trim()) throw new Error("카테고리를 입력하세요");
  if (/[^a-z0-9\-]/.test(data.id)) throw new Error("슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다");

  await db.insert(posts).values({
    id: data.id,
    title: data.title,
    date: data.date,
    description: data.description,
    category: data.category,
    tags: data.tags,
    content: data.content,
    contentHtml: data.contentHtml,
    published: data.published,
  });

  revalidateAllPostPages(data.id);
  return { success: true, slug: data.id };
}

export async function updatePost(
  slug: string,
  data: {
    title?: string;
    date?: string;
    description?: string;
    category?: string;
    tags?: string[];
    content?: unknown;
    contentHtml?: string;
    published?: boolean;
  }
) {
  assertAuth(await isAuthenticated());

  await db
    .update(posts)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(posts.id, slug));

  revalidateAllPostPages(slug);
  return { success: true };
}

export async function deletePost(slug: string) {
  assertAuth(await isAuthenticated());

  // Delete associated blob files
  const files = await db
    .select()
    .from(blobFiles)
    .where(eq(blobFiles.postSlug, slug));

  for (const file of files) {
    try {
      await del(file.url);
    } catch {
      // blob may already be deleted
    }
  }

  await db.delete(blobFiles).where(eq(blobFiles.postSlug, slug));
  await db.delete(posts).where(eq(posts.id, slug));

  revalidateAllPostPages();
  return { success: true };
}

export async function togglePublish(slug: string, published: boolean) {
  assertAuth(await isAuthenticated());

  await db
    .update(posts)
    .set({ published, updatedAt: new Date().toISOString() })
    .where(eq(posts.id, slug));

  revalidateAllPostPages(slug);
  return { success: true };
}
