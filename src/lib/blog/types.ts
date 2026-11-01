export const CATEGORIES = [
  { value: "tin-tuc", label: "Tin tức" },
  { value: "sapphire", label: "Sapphire" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type PostStatus = "draft" | "published";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string | null;
  category: Category;
  reading_minutes: number;
  like_count: number;
  published_at: string;
};

export type Post = PostSummary & { content_html: string };

export type EditablePost = Omit<Post, "published_at" | "like_count" | "reading_minutes"> & {
  status: PostStatus;
};

export type PostComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

/** "14 thg 10, 2026", fixed to Vietnam time so server and browser agree. */
export function formatDate(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return `${part("day")} thg ${part("month")}, ${part("year")}`;
}
