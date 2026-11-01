import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/components/blog/LikeButton";
import PostMenu from "@/components/blog/PostMenu";
import { formatDate, type PostSummary } from "@/lib/blog/types";

/** `compact` is the "Bài đăng gần đây" variant: no date row, smaller title. */
export default function PostCard({ post, compact = false }: { post: PostSummary; compact?: boolean }) {
  const href = `/blog/${post.slug}`;

  return (
    <article
      className="post-card group flex flex-col h-full bg-white"
      style={compact ? { border: "1px solid var(--ice-deep)" } : undefined}
    >
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[9/5] overflow-hidden">
        <Image
          src={post.cover_url ?? "/images/water-texture-detail.jpg"}
          alt=""
          fill
          sizes={compact ? "(min-width: 768px) 280px, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
          className="object-cover transition-transform duration-1000 group-hover:scale-[1.04]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        />
      </Link>

      <div className={`flex flex-col flex-1 ${compact ? "px-5 pt-4 pb-3" : "px-7 pt-7 pb-5"}`}>
        {!compact && (
          <div className="flex items-center justify-between" style={{ fontSize: "var(--text-xs)", color: "var(--ink)" }}>
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            <PostMenu id={post.id} slug={post.slug} title={post.title} />
          </div>
        )}

        <h2
          className={`${compact ? "line-clamp-2" : "line-clamp-3 mt-5"} mb-5`}
          style={{
            fontSize: compact ? "var(--text-base)" : "var(--text-xl)",
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            color: "var(--sapphire-dark)",
          }}
        >
          <Link href={href} className="transition-colors duration-300 hover:text-[var(--sapphire-blue)]">
            {post.title}
          </Link>
        </h2>

        <div className="hairline mt-auto" />
        <div className={`flex items-center pt-3 ${compact ? "justify-end" : "justify-start"}`}>
          <LikeButton postId={post.id} count={post.like_count} />
        </div>
      </div>
    </article>
  );
}
