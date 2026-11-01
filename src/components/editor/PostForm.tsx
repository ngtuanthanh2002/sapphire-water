"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, PencilLine } from "lucide-react";
import { savePost } from "@/lib/blog/actions";
import { CATEGORIES, type Category, type EditablePost, type PostStatus } from "@/lib/blog/types";
import CoverPicker from "./CoverPicker";
import RichTextEditor from "./RichTextEditor";

export default function PostForm({ post }: { post?: EditablePost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState<Category>(post?.category ?? "tin-tuc");
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_url ?? null);
  const [html, setHtml] = useState(post?.content_html ?? "");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  const published = post?.status === "published";

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
      setNotice("");
    };
  }

  function save(status: PostStatus) {
    setError("");
    setNotice("");

    startTransition(async () => {
      const result = await savePost({
        id: post?.id ?? null,
        title,
        slug,
        excerpt,
        category,
        coverUrl,
        html,
        status,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setDirty(false);
      setSlug(result.slug);

      if (status === "published") {
        router.push(`/blog/${result.slug}`);
      } else {
        setNotice("Đã lưu nháp.");
        if (!post) router.replace(`/admin/posts/${result.id}`);
        else if (published) router.refresh();
      }
    });
  }

  return (
    <div className="container-x pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2"
          style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}
        >
          <ArrowLeft size={16} />
          Tất cả bài viết
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {notice && <span style={{ fontSize: "var(--text-sm)", color: "var(--sapphire-blue)" }}>{notice}</span>}
          <button type="button" onClick={() => setPreview((v) => !v)} className="btn btn--ghost">
            {preview ? <PencilLine size={16} /> : <Eye size={16} />}
            {preview ? "Tiếp tục viết" : "Xem trước"}
          </button>
          <button type="button" disabled={pending} onClick={() => save("draft")} className="btn btn--ghost">
            {published ? "Chuyển về nháp" : "Lưu nháp"}
          </button>
          <button type="button" disabled={pending} onClick={() => save("published")} className="btn btn--primary">
            {pending ? "Đang lưu…" : published ? "Cập nhật" : "Đăng bài"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 px-4 py-3"
          style={{ fontSize: "var(--text-sm)", color: "#C0392B", background: "#FDECEA", borderRadius: "0.375rem" }}
        >
          {error}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] items-start">
        <div className="min-w-0">
          <textarea
            value={title}
            onChange={(e) => edit(setTitle)(e.target.value)}
            placeholder="Tiêu đề bài viết"
            aria-label="Tiêu đề bài viết"
            rows={2}
            maxLength={200}
            className="w-full mb-5 bg-transparent border-none outline-none resize-none"
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              color: "var(--sapphire-dark)",
            }}
          />

          {/* Kept mounted so undo history and the cursor survive a preview. */}
          <div hidden={preview}>
            <RichTextEditor initialHtml={post?.content_html ?? ""} onChange={edit(setHtml)} />
          </div>
          {preview && (
            <div
              className="article-body bg-white p-[clamp(1.5rem,5vw,4rem)] min-h-[26rem]"
              style={{ border: "1px solid var(--ink-15)", borderRadius: "0.5rem" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        <aside
          className="flex flex-col gap-6 bg-white p-5 lg:sticky lg:top-24"
          style={{ border: "1px solid var(--ink-15)", borderRadius: "0.5rem" }}
        >
          <div>
            <p className="field-label">Trạng thái</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--ink)" }}>
              {published ? "Đã đăng" : post ? "Bản nháp" : "Bài viết mới"}
            </p>
          </div>

          <div>
            <label htmlFor="category" className="field-label">
              Chuyên mục
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => edit(setCategory)(e.target.value as Category)}
              className="field"
            >
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="field-label">Ảnh đại diện (hiện ở danh sách bài viết)</p>
            <CoverPicker value={coverUrl} onChange={edit(setCoverUrl)} />
          </div>

          <div>
            <label htmlFor="excerpt" className="field-label">
              Mô tả ngắn (để trống sẽ tự tạo)
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => edit(setExcerpt)(e.target.value)}
              rows={3}
              maxLength={400}
              className="field resize-y"
            />
          </div>

          <div>
            <label htmlFor="slug" className="field-label">
              Đường dẫn (để trống sẽ tự tạo từ tiêu đề)
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => edit(setSlug)(e.target.value)}
              placeholder="vi-du-duong-dan"
              className="field"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
