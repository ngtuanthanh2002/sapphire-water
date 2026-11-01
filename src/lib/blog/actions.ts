"use server";

import { updateTag } from "next/cache";
import { getAdminClient } from "@/lib/auth";
import { SUPABASE_URL, supabaseReady } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import { cleanHtml, makeExcerpt, plainText, readingMinutes, slugify } from "./html";
import { CATEGORIES, type Category, type PostStatus } from "./types";

type Failure = { error: string };

const NOT_ADMIN = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

export type PostInput = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
  coverUrl: string | null;
  html: string;
  status: PostStatus;
};

export async function savePost(input: PostInput): Promise<Failure | { id: string; slug: string }> {
  const supabase = await getAdminClient();
  if (!supabase) return { error: NOT_ADMIN };

  const title = input.title.trim();
  if (!title) return { error: "Vui lòng nhập tiêu đề bài viết." };
  if (title.length > 200) return { error: "Tiêu đề không được dài quá 200 ký tự." };
  if (!CATEGORIES.some((c) => c.value === input.category)) return { error: "Chuyên mục không hợp lệ." };

  const contentHtml = cleanHtml(input.html);
  const text = plainText(contentHtml);
  if (input.status === "published" && !text && !contentHtml.includes("<img")) {
    return { error: "Bài viết chưa có nội dung." };
  }

  const baseSlug = slugify(input.slug) || slugify(title) || "bai-viet";
  let slug = baseSlug;
  for (let n = 2; ; n++) {
    let taken = supabase.from("posts").select("id").eq("slug", slug);
    if (input.id) taken = taken.neq("id", input.id);
    const { data } = await taken.maybeSingle();
    if (!data) break;
    slug = `${baseSlug}-${n}`;
  }

  let publishedAt: string | null = null;
  if (input.id) {
    const { data } = await supabase.from("posts").select("published_at").eq("id", input.id).single();
    publishedAt = data?.published_at ?? null;
  }
  if (input.status === "published" && !publishedAt) publishedAt = new Date().toISOString();

  const row = {
    slug,
    title,
    excerpt: input.excerpt.trim().slice(0, 400) || makeExcerpt(text),
    category: input.category,
    // next/image only accepts our own bucket, so anything else would crash the card.
    cover_url: input.coverUrl?.startsWith(`${SUPABASE_URL}/storage/`) ? input.coverUrl : null,
    content_html: contentHtml,
    reading_minutes: readingMinutes(text),
    status: input.status,
    published_at: publishedAt,
  };

  const query = input.id
    ? supabase.from("posts").update(row).eq("id", input.id)
    : supabase.from("posts").insert(row);
  const { data, error } = await query.select("id, slug").single();

  if (error) {
    console.error("savePost:", error.message);
    return { error: "Không lưu được bài viết. Vui lòng thử lại." };
  }

  updateTag("posts");
  return data;
}

export async function deletePost(id: string): Promise<Failure | { ok: true }> {
  const supabase = await getAdminClient();
  if (!supabase) return { error: NOT_ADMIN };

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("deletePost:", error.message);
    return { error: "Không xóa được bài viết." };
  }

  updateTag("posts");
  return { ok: true };
}

export async function addComment(postId: string, formData: FormData): Promise<Failure | { ok: true }> {
  // Hidden field: only bots fill it. Pretend it worked so they don't adapt.
  if (formData.get("website")) return { ok: true };

  const authorName = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!authorName) return { error: "Vui lòng nhập tên của bạn." };
  if (!body) return { error: "Vui lòng nhập nội dung bình luận." };
  if (authorName.length > 80) return { error: "Tên không được dài quá 80 ký tự." };
  if (body.length > 2000) return { error: "Bình luận không được dài quá 2000 ký tự." };
  if (!supabaseReady) return { error: "Chưa kết nối cơ sở dữ liệu." };

  const { error } = await createPublicClient()
    .from("comments")
    .insert({ post_id: postId, author_name: authorName, body });

  if (error) {
    console.error("addComment:", error.message);
    return { error: "Không gửi được bình luận. Vui lòng thử lại." };
  }

  updateTag(`comments:${postId}`);
  return { ok: true };
}

export async function deleteComment(id: string, postId: string): Promise<Failure | { ok: true }> {
  const supabase = await getAdminClient();
  if (!supabase) return { error: NOT_ADMIN };

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    console.error("deleteComment:", error.message);
    return { error: "Không xóa được bình luận." };
  }

  updateTag(`comments:${postId}`);
  return { ok: true };
}

export async function setPostLike(postId: string, liked: boolean): Promise<Failure | { ok: true }> {
  if (!supabaseReady) return { error: "Chưa kết nối cơ sở dữ liệu." };

  const { error } = await createPublicClient().rpc("set_post_like", {
    p_post_id: postId,
    p_liked: liked,
  });

  if (error) {
    console.error("setPostLike:", error.message);
    return { error: "Không lưu được lượt thích." };
  }
  return { ok: true };
}
