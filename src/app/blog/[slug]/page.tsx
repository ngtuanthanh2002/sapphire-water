import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogBackdrop from "@/components/blog/BlogBackdrop";
import Comments from "@/components/blog/Comments";
import LikeButton from "@/components/blog/LikeButton";
import PostCard from "@/components/blog/PostCard";
import PostMenu from "@/components/blog/PostMenu";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPost, getPublishedPosts } from "@/lib/blog/queries";
import { formatDate } from "@/lib/blog/types";

type Props = { params: Promise<{ slug: string }> };

const FRAME = { border: "1px solid var(--ice-deep)" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Không tìm thấy bài viết — Sapphire Water" };

  return {
    title: `${post.title} — Sapphire Water`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

function ArticleSkeleton() {
  return (
    <div style={FRAME} className="min-h-[70svh] p-[clamp(1.5rem,7vw,5.5rem)]">
      <div className="h-3 w-24 animate-pulse" style={{ backgroundColor: "var(--ice-blue)" }} />
      <div className="mt-6 h-10 w-4/5 animate-pulse" style={{ backgroundColor: "var(--ice-blue)" }} />
      <div className="mt-10 h-64 animate-pulse" style={{ backgroundColor: "var(--ice-blue)" }} />
    </div>
  );
}

async function Article({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const recent = (await getPublishedPosts()).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <article style={FRAME} className="p-[clamp(1.5rem,7vw,5.5rem)]">
        <div className="flex items-center justify-between" style={{ fontSize: "var(--text-xs)", color: "var(--ink)" }}>
          <p>
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            {post.reading_minutes} phút đọc
          </p>
          <PostMenu id={post.id} slug={post.slug} title={post.title} leaveOnDelete />
        </div>

        <h1
          className="mt-5"
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "var(--sapphire-dark)",
          }}
        >
          {post.title}
        </h1>

        {/* cleanHtml() whitelists this on every save; see src/lib/blog/html.ts */}
        <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: post.content_html }} />

        <div className="hairline mt-12" />
        <div className="flex justify-end pt-3">
          <LikeButton postId={post.id} count={post.like_count} />
        </div>
      </article>

      {recent.length > 0 && (
        <section aria-labelledby="recent-posts" className="px-[clamp(0.25rem,1vw,0.75rem)]">
          <div className="flex items-baseline justify-between mb-4">
            <h2
              id="recent-posts"
              style={{ fontSize: "var(--text-base)", fontWeight: 500, letterSpacing: 0, color: "var(--sapphire-dark)" }}
            >
              Bài đăng gần đây
            </h2>
            <Link href="/blog" style={{ fontSize: "var(--text-xs)", color: "var(--sapphire-blue)" }}>
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {recent.map((item) => (
              <PostCard key={item.id} post={item} compact />
            ))}
          </div>
        </section>
      )}

      <section style={FRAME} className="px-[clamp(1.5rem,7vw,5.5rem)] py-12">
        <Comments postId={post.id} />
      </section>
    </>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <>
      <Header startDark />
      <main data-header="dark" className="relative min-h-svh">
        <BlogBackdrop />
        <div className="mx-auto max-w-[57rem] px-3 md:px-0" style={{ paddingTop: "6.5rem" }}>
          <div className="flex flex-col gap-8 bg-white p-3 md:p-4">
            <Suspense fallback={<ArticleSkeleton />}>
              <Article params={params} />
            </Suspense>
          </div>
        </div>
        <div className="h-20" />
      </main>
      <Footer />
    </>
  );
}
