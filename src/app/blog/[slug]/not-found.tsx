import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <p style={{ fontSize: "var(--text-xl)", color: "var(--sapphire-dark)" }}>Không tìm thấy bài viết này.</p>
      <Link href="/blog" className="btn btn--primary">
        Về trang Blog
      </Link>
    </div>
  );
}
