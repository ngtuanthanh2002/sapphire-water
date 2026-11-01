import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị — Sapphire Water",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden lg:block" style={{ backgroundColor: "var(--abyss)" }}>
        <Image
          src="/images/water-flow-abstract.jpg"
          alt=""
          fill
          preload
          sizes="55vw"
          className="object-cover object-[58%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(4, 29, 56, 0.6) 0%, rgba(4, 29, 56, 0.1) 38%, rgba(4, 29, 56, 0.88) 100%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-[clamp(2.5rem,4vw,4rem)]">
          <Link href="/" aria-label="Sapphire Water — về trang chủ" className="block w-fit">
            <Image
              src="/images/logo-white.png"
              alt="Sapphire Water"
              width={1001}
              height={277}
              sizes="160px"
              className="-ml-3.5 h-[40px] w-auto"
            />
          </Link>

          <div>
            <p className="display" style={{ fontSize: "var(--text-5xl)", color: "var(--pure-white)" }}>
              Pure Life –
              <br />
              <b>Pure Water</b>
            </p>
            <p className="mt-5 max-w-[26rem]" style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.68)", fontWeight: 300 }}>
              Nước uống tinh khiết cao cấp, tinh lọc bằng công nghệ hiện đại.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex min-h-svh flex-col px-6 py-7 sm:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" aria-label="Sapphire Water — về trang chủ" className="block lg:hidden">
            <Image
              src="/images/logo-color.png"
              alt="Sapphire Water"
              width={1001}
              height={277}
              sizes="130px"
              className="-ml-3 h-[34px] w-auto"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-[var(--sapphire-blue)]"
            style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Trang chủ
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[23rem]">
            <span className="eyebrow">Quản trị</span>
            <h1 className="display mt-5" style={{ fontSize: "var(--text-4xl)", color: "var(--deep-ocean)" }}>
              Đăng <b>nhập</b>
            </h1>
            <p className="lede mt-4 mb-9">Quản lý bài viết và bình luận trên website.</p>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
