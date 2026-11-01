import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminLoading from "@/components/editor/AdminLoading";
import DeletePostButton from "@/components/editor/DeletePostButton";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, formatDate, type Category, type PostStatus } from "@/lib/blog/types";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  status: PostStatus;
  like_count: number;
  published_at: string | null;
  updated_at: string;
  comments: { count: number }[];
};

const CELL = "px-4 py-3 whitespace-nowrap";

async function PostsTable() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, category, status, like_count, published_at, updated_at, comments(count)")
    .order("updated_at", { ascending: false });

  if (error) {
    return <p style={{ fontSize: "var(--text-sm)", color: "#C0392B" }}>Không tải được danh sách bài viết.</p>;
  }

  const posts = (data ?? []) as Row[];

  if (posts.length === 0) {
    return <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}>Chưa có bài viết nào.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white" style={{ border: "1px solid var(--ink-15)", borderRadius: "0.5rem" }}>
      <table className="w-full" style={{ fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
        <thead>
          <tr className="text-left" style={{ color: "var(--ink-70)", borderBottom: "1px solid var(--ink-15)" }}>
            <th className="px-4 py-3 font-medium">Tiêu đề</th>
            <th className={`${CELL} font-medium`}>Chuyên mục</th>
            <th className={`${CELL} font-medium`}>Trạng thái</th>
            <th className={`${CELL} font-medium`}>Ngày đăng</th>
            <th className={`${CELL} font-medium`}>Thích</th>
            <th className={`${CELL} font-medium`}>Bình luận</th>
            <th className={`${CELL} font-medium`}>
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: "1px solid var(--ink-08)" }}>
              <td className="px-4 py-3 min-w-64">
                <Link href={`/admin/posts/${post.id}`} style={{ color: "var(--sapphire-dark)", fontWeight: 500 }}>
                  {post.title}
                </Link>
              </td>
              <td className={CELL}>{CATEGORIES.find((c) => c.value === post.category)?.label}</td>
              <td className={CELL}>
                <span
                  className="inline-block px-2.5 py-0.5"
                  style={{
                    fontSize: "var(--text-xs)",
                    borderRadius: 999,
                    color: post.status === "published" ? "var(--sapphire-blue)" : "var(--ink-70)",
                    backgroundColor: post.status === "published" ? "var(--ice-blue)" : "var(--ink-08)",
                  }}
                >
                  {post.status === "published" ? "Đã đăng" : "Nháp"}
                </span>
              </td>
              <td className={CELL}>{post.published_at ? formatDate(post.published_at) : "—"}</td>
              <td className={CELL}>{post.like_count}</td>
              <td className={CELL}>{post.comments[0]?.count ?? 0}</td>
              <td className={CELL}>
                <div className="flex justify-end gap-4">
                  {post.status === "published" && (
                    <Link href={`/blog/${post.slug}`} style={{ color: "var(--sapphire-blue)" }}>
                      Xem
                    </Link>
                  )}
                  <Link href={`/admin/posts/${post.id}`} style={{ color: "var(--sapphire-blue)" }}>
                    Sửa
                  </Link>
                  <DeletePostButton id={post.id} title={post.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPostsPage() {
  return (
    <div className="container-x pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 500, color: "var(--sapphire-dark)" }}>Bài viết</h1>
        <div className="flex gap-3">
          <Link href="/blog" className="btn btn--ghost">
            Xem trang Blog
          </Link>
          <Link href="/admin/posts/new" className="btn btn--primary">
            <Plus size={16} />
            Đăng bài
          </Link>
        </div>
      </div>
      <Suspense fallback={<AdminLoading />}>
        <PostsTable />
      </Suspense>
    </div>
  );
}
