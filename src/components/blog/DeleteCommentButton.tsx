"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deleteComment } from "@/lib/blog/actions";

export default function DeleteCommentButton({ id, postId }: { id: string; postId: string }) {
  const { isAdmin } = useAuth();
  const [confirming, setConfirming] = useState(false);

  if (!isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Xóa bình luận"
        className="flex items-center justify-center w-7 h-7 bg-transparent border-none cursor-pointer"
        style={{ color: "var(--ink-50)" }}
      >
        <Trash2 size={15} />
      </button>
      <ConfirmDialog
        open={confirming}
        title="Xóa bình luận này?"
        message="Bình luận sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmLabel="Xóa bình luận"
        action={() => deleteComment(id, postId)}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}
