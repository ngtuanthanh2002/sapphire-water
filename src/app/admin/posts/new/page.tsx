import { Suspense } from "react";
import AdminLoading from "@/components/editor/AdminLoading";
import PostForm from "@/components/editor/PostForm";
import { requireAdmin } from "@/lib/auth";

async function NewPost() {
  await requireAdmin();
  return <PostForm />;
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewPost />
    </Suspense>
  );
}
