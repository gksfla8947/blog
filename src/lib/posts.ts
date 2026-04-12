import { db } from "./db";
import { posts } from "./db/schema";
import { eq, desc } from "drizzle-orm";

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category: string;
  readingTime: string;
  content: string; // contentHtml for rendering
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

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function extractCoverImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

function dbPostToPost(row: typeof posts.$inferSelect): Post {
  const html = row.contentHtml ?? "";
  return {
    slug: row.id,
    title: row.title,
    date: typeof row.date === "string" ? row.date : new Date(row.date).toISOString(),
    description: row.description ?? "",
    tags: row.tags ?? [],
    category: row.category,
    readingTime: estimateReadingTime(html),
    content: html,
    thumbnail: slugToThumbnail(row.id),
    coverImage: extractCoverImage(html),
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.date));

  return rows.map(dbPostToPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.id, slug))
    .limit(1);

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
