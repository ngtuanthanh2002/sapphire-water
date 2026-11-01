"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import PostCard from "@/components/blog/PostCard";
import { CATEGORIES, type Category, type PostSummary } from "@/lib/blog/types";

const PAGE_SIZE = 9;

const fold = (text: string) =>
  text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const TABS: { value: Category | "all"; label: string }[] = [{ value: "all", label: "Tất cả" }, ...CATEGORIES];

export default function BlogIndex({ posts }: { posts: PostSummary[] }) {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Category | "all">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = fold(query.trim());
    return posts.filter(
      (post) =>
        (tab === "all" || post.category === tab) &&
        (!needle || fold(`${post.title} ${post.excerpt}`).includes(needle)),
    );
  }, [posts, tab, query]);

  function chooseTab(value: Category | "all") {
    setTab(value);
    setVisible(PAGE_SIZE);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
        <nav aria-label="Chuyên mục" className="flex flex-wrap items-center gap-x-10 gap-y-2">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={tab === item.value}
              onClick={() => chooseTab(item.value)}
              className="bg-transparent border-none cursor-pointer p-0 transition-colors duration-300"
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: 500,
                color: tab === item.value ? "var(--sapphire-light)" : "var(--pure-white)",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          {searchOpen ? (
            <div className="relative">
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder="Tìm kiếm bài viết…"
                aria-label="Tìm kiếm bài viết"
                className="field w-60 pr-9"
              />
              <button
                type="button"
                aria-label="Đóng tìm kiếm"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1"
                style={{ color: "var(--ink-70)" }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer"
              style={{ color: "var(--pure-white)" }}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          )}

          {isAdmin && (
            <>
              <Link href="/admin/posts" prefetch={false} className="btn btn--outline-light">
                Quản lý bài viết
              </Link>
              <Link href="/admin/posts/new" prefetch={false} className="btn btn--light">
                <Plus size={16} />
                Đăng bài
              </Link>
            </>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visible).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="btn btn--outline-light"
              >
                Xem thêm bài viết
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-16" style={{ fontSize: "var(--text-base)", color: "rgba(255,255,255,0.8)" }}>
          {query || tab !== "all" ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết nào."}
        </p>
      )}
    </>
  );
}
