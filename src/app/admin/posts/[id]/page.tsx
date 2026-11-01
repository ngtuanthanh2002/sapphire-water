import { Suspense } from "react";
import { notFound } from "next/navigation";
import AdminLoading from "@/components/editor/AdminLoading";
import PostForm from "@/components/editor/PostForm";
import { requireAdmin } from "@/lib/auth";
import type { EditablePost } from "@/lib/blog/types";

type Props = { params: Promise<{ id: string }> };

async function EditPost({ params }: Props) {
  const supabase = await requireAdmin();
  const { id } = await params;

  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_url, category, content_html, status")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const post = data as EditablePost;
  return <PostForm key={`${post.id}:${post.status}`} post={post} />;
}

export default function EditPostPage({ params }: Props) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditPost params={params} />
    </Suspense>
  );
}
