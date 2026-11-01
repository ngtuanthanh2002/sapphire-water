"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deletePost } from "@/lib/blog/actions";

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="bg-transparent border-none cursor-pointer p-0"
        style={{ color: "#C0392B" }}
      >
        Xóa
      </button>
      <ConfirmDialog
        open={confirming}
        title="Xóa bài viết này?"
        message={`"${title}" và toàn bộ bình luận của bài sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa bài"
        action={() => deletePost(id)}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}
