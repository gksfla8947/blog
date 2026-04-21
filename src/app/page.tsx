import { getAllPosts } from "@/lib/posts";
import HeroIllustration from "@/components/HeroIllustration";
import PostList from "@/components/PostList";
import { redis, postViewKey } from "@/lib/redis";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllPosts();

  // 모든 포스트 조회수를 Redis mget으로 한 번에 조회
  const viewsMap: Record<string, number> = {};
  if (posts.length > 0) {
    const keys = posts.map((p) => postViewKey(p.slug));
    const counts = await redis.mget<(number | null)[]>(...keys);
    posts.forEach((p, i) => {
      viewsMap[p.slug] = counts[i] ?? 0;
    });
  }

  // Build category list with counts
  const catMap = new Map<string, number>();
  posts.forEach((p) => catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1));
  const categories = Array.from(catMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="hero-pattern border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 leading-tight">
                <span className="gradient-text">DEVS</span>
                <br />
                <span className="gradient-text">VLTRA</span>
              </h1>
              <div className="mb-3" />

              {/* Stats */}
              <div className="flex gap-5">
                <div className="stat-item">
                  <div className="stat-number text-lg">{posts.length}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">Posts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number text-lg">{categories.length}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">Categories</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number text-lg">
                    {Array.from(new Set(posts.flatMap((p) => p.tags))).length}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">Tags</div>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden sm:block flex-shrink-0">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Posts + Sidebar */}
      <PostList posts={posts} categories={categories} viewsMap={viewsMap} />
    </div>
  );
}
