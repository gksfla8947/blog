import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import HeroIllustration from "@/components/HeroIllustration";

export default function HomePage() {
  const posts = getAllPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="hero-pattern border-b border-[var(--card-border)]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
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

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="border-b border-[var(--card-border)] bg-[var(--card)]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
              <span className="category-chip active">All</span>
              {categories.map((cat) => (
                <span key={cat} className="category-chip">{cat}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
            Recent Posts
          </h2>
          <span className="text-xs text-[var(--muted)]">{posts.length}개의 글</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <p className="text-[var(--muted)]">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="stagger-in flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
