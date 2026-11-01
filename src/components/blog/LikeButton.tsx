"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Heart } from "lucide-react";
import { setPostLike } from "@/lib/blog/actions";

const STORAGE_KEY = "sapphire:liked-posts";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readLiked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLiked(id: string, liked: boolean) {
  const others = readLiked().filter((v) => v !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liked ? [...others, id] : others));
  listeners.forEach((listener) => listener());
}

/** Visitors have no account, so "already liked" is remembered per browser. */
export default function LikeButton({ postId, count }: { postId: string; count: number }) {
  const liked = useSyncExternalStore(
    subscribe,
    () => readLiked().includes(postId),
    () => false,
  );
  const [delta, setDelta] = useState(0);
  const [, startTransition] = useTransition();

  const shown = Math.max(count + delta, 0);

  function toggle() {
    const next = !liked;
    const step = next ? 1 : -1;
    writeLiked(postId, next);
    setDelta((d) => d + step);

    startTransition(async () => {
      const result = await setPostLike(postId, next);
      if ("error" in result) {
        writeLiked(postId, !next);
        setDelta((d) => d - step);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "Bỏ thích bài viết" : "Thích bài viết"}
      className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
      style={{ fontSize: "var(--text-xs)", color: "#D9483B" }}
    >
      {shown > 0 && <span>{shown}</span>}
      <Heart size={20} strokeWidth={1.5} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
