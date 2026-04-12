import { getAllPosts } from "@/lib/posts";
import HeroIllustration from "@/components/HeroIllustration";
import PostList from "@/components/PostList";

export default function HomePage() {
  const posts = getAllPosts();

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
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 mb-5 text-xs font-medium rounded-full border border-[var(--accent)]/20 bg-[var(--card)]/70 text-[var(--foreground)] backdrop-blur-sm shadow-sm">
                <img src="/profile.svg" alt="profile" className="w-5 h-5 rounded-full object-cover" />
                gksfla8947
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                <span className="gradient-text">DEVS</span>
                <br />
                <span className="gradient-text">VLTRA</span>
              </h1>
              <div className="mb-6" />

              {/* Stats */}
              <div className="flex gap-6">
                <div className="stat-item">
                  <div className="stat-number">{posts.length}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">Posts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{categories.length}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">Categories</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {Array.from(new Set(posts.flatMap((p) => p.tags))).length}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">Tags</div>
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
      <PostList posts={posts} categories={categories} />
    </div>
  );
}
