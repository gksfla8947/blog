import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  category: string;
  readingTime: string;
  content: string;
  thumbnail: number;
  coverImage: string | null;
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith(".mdx"));

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
    return getPostBySlug(slug);
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): Post {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  // Generate a consistent thumbnail index from the slug
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const thumbnail = (Math.abs(hash) % 5) + 1;

  // Extract first image from content as cover image
  const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
  const coverImage = imgMatch ? imgMatch[1] : null;

  return {
    slug,
    title: data.title ?? "Untitled",
    date: data.date ?? "",
    description: data.description ?? "",
    tags: data.tags ?? [],
    category: data.category ?? "General",
    readingTime: stats.text,
    content,
    thumbnail,
    coverImage,
  };
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const catSet = new Set<string>();
  posts.forEach((post) => catSet.add(post.category));
  return Array.from(catSet).sort();
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}
