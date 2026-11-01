import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Quản trị — Sapphire Water",
  robots: { index: false, follow: false },
};

// Access is checked per page with requireAdmin(): layouts don't re-render on
// client navigation, so a check here would not hold.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-svh" style={{ backgroundColor: "var(--ice-blue)", paddingTop: "7rem" }}>
        {children}
      </main>
    </>
  );
}
