"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addComment } from "@/lib/blog/actions";

export default function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError("");

    startTransition(async () => {
      const result = await addComment(postId, formData);
      if ("error" in result) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex flex-col gap-3">
      <input
        name="name"
        required
        maxLength={80}
        autoComplete="name"
        placeholder="Tên của bạn"
        aria-label="Tên của bạn"
        className="field"
      />
      <textarea
        name="body"
        required
        maxLength={2000}
        rows={3}
        placeholder="Viết bình luận…"
        aria-label="Nội dung bình luận"
        className="field resize-y"
      />

      {/* Honeypot: off-screen for people, tempting for bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" />

      {error && (
        <p role="alert" style={{ fontSize: "var(--text-sm)", color: "#C0392B" }}>
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn btn--primary">
          {pending ? "Đang gửi…" : "Gửi bình luận"}
        </button>
      </div>
    </form>
  );
}
