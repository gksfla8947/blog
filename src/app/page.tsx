import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My CS Academia</h1>
        <p className="text-[var(--muted)]">개발 관련 정리 블로그</p>
      </section>

      {posts.length === 0 ? (
        <p className="text-[var(--muted)] text-center py-16">아직 작성된 글이 없습니다.</p>
      ) : (
        <section className="divide-y divide-[var(--card-border)]">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      )}
    </div>
  );
}
