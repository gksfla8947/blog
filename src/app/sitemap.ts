import type { MetadataRoute } from "next";
import { getAllPostsForBuild } from "@/lib/posts";

const BASE_URL = "https://devs-vltra.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 빌드 시 DB 가 flaky 해도 sitemap 은 비어있는 채로라도 생성되게 한다.
  // 빈 sitemap 이라도 root URL 은 포함되므로 검색엔진 입장에선 무해.
  const posts = await getAllPostsForBuild();

  const postEntries = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...postEntries,
  ];
}
