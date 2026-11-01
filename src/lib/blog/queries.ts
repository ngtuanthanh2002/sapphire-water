import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { supabaseReady } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";
import type { Post, PostComment, PostSummary } from "./types";

const SUMMARY_COLUMNS =
  "id, slug, title, excerpt, cover_url, category, reading_minutes, like_count, published_at";

// Read failures log and fall through to an empty result rather than throw: a
// throw during prerender fails the whole build, e.g. before the migration has run.

export async function getPublishedPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheTag("posts");
  cacheLife("minutes");

  if (!supabaseReady) return [];

  const { data, error } = await createPublicClient()
    .from("posts")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) console.error("getPublishedPosts:", error.message);
  return (data ?? []) as PostSummary[];
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag("posts");
  cacheLife("minutes");

  if (!supabaseReady) return null;

  const { data, error } = await createPublicClient()
    .from("posts")
    .select(`${SUMMARY_COLUMNS}, content_html`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) console.error("getPost:", error.message);
  return data as Post | null;
}

export async function getComments(postId: string): Promise<PostComment[]> {
  "use cache";
  cacheTag(`comments:${postId}`);
  cacheLife("minutes");

  if (!supabaseReady) return [];

  const { data, error } = await createPublicClient()
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) console.error("getComments:", error.message);
  return (data ?? []) as PostComment[];
}
