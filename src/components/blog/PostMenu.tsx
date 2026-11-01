"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EllipsisVertical } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deletePost } from "@/lib/blog/actions";
import { useClickOutside } from "@/lib/useClickOutside";

const ITEM = "block w-full text-left px-4 py-2 bg-transparent border-none cursor-pointer hover:bg-[var(--ice-blue)]";

export default function PostMenu({
  id,
  slug,
  title,
  leaveOnDelete = false,
}: {
  id: string;
  slug: string;
  title: string;
  /** On the post's own page: go back to the list once it's gone. */
  leaveOnDelete?: boolean;
}) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, open, close);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 900);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Tùy chọn bài viết"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-7 h-7 -mr-1.5 bg-transparent border-none cursor-pointer"
        style={{ color: "var(--ink)" }}
      >
        <EllipsisVertical size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 min-w-44 py-1.5 bg-white"
          style={{
            fontSize: "var(--text-sm)",
            border: "1px solid var(--ink-15)",
            borderRadius: "0.375rem",
            boxShadow: "0 12px 32px rgba(6, 43, 82, 0.14)",
          }}
        >
          <button type="button" onClick={copyLink} className={ITEM}>
            {copied ? "Đã sao chép" : "Sao chép liên kết"}
          </button>
          {isAdmin && (
            <>
              <Link href={`/admin/posts/${id}`} className={ITEM}>
                Chỉnh sửa
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirming(true);
                }}
                className={ITEM}
                style={{ color: "#C0392B" }}
              >
                Xóa bài
              </button>
            </>
          )}
        </div>
      )}

      {isAdmin && (
        <ConfirmDialog
          open={confirming}
          title="Xóa bài viết này?"
          message={`"${title}" và toàn bộ bình luận của bài sẽ bị xóa vĩnh viễn.`}
          confirmLabel="Xóa bài"
          action={() => deletePost(id)}
          onClose={() => setConfirming(false)}
          onDone={leaveOnDelete ? () => router.push("/blog") : undefined}
        />
      )}
    </div>
  );
}
