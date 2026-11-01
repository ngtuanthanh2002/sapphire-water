import type { Metadata } from "next";
import BlogBackdrop from "@/components/blog/BlogBackdrop";
import BlogIndex from "@/components/blog/BlogIndex";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getPublishedPosts } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Blog — Sapphire Water",
  description: "Tin tức và câu chuyện từ Sapphire Water — nước uống tinh khiết cao cấp.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header startDark />
      <main data-header="dark" className="relative min-h-svh">
        <BlogBackdrop />
        <div className="container-x" style={{ paddingTop: "clamp(8rem, 18vh, 10.5rem)", paddingBottom: "var(--section-pad-y)" }}>
          <h1 className="display mb-10" style={{ fontSize: "var(--text-4xl)", color: "var(--pure-white)" }}>
            Blog
          </h1>
          <BlogIndex posts={posts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
