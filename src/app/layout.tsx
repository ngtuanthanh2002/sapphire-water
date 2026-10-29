import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Sapphire Water — Pure Life – Pure Water",
  description:
    "Sapphire Water — Nước uống tinh khiết cao cấp. Trải nghiệm sự thuần khiết hoàn hảo với từng giọt nước trong trẻo, được tinh lọc bằng công nghệ hiện đại.",
  keywords: [
    "nước tinh khiết",
    "nước uống cao cấp",
    "Sapphire Water",
    "pure water",
    "premium water",
  ],
  openGraph: {
    title: "Sapphire Water — Pure Life – Pure Water",
    description:
      "Trải nghiệm sự thuần khiết hoàn hảo với Sapphire Water — thương hiệu nước uống tinh khiết cao cấp.",
    type: "website",
    locale: "vi_VN",
    siteName: "Sapphire Water",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body>{children}</body>
    </html>
  );
}
