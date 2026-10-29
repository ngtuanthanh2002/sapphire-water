import Image from "next/image";

const navItems = [
  { label: "Tinh khiết", href: "#essence" },
  { label: "Trải nghiệm", href: "#motion" },
  { label: "Sản phẩm", href: "#product" },
  { label: "Chất lượng", href: "#quality" },
  { label: "Thương hiệu", href: "#brand" },
];

// Static on purpose: the page is fully prerendered (cacheComponents),
// and a render-time `new Date()` would be frozen at build time anyway.
const YEAR = 2026;

export default function Footer() {
  return (
    <footer
      data-header="dark"
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--abyss)", paddingTop: "clamp(5rem, 14vh, 9rem)" }}
    >
      <div className="container-x">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-16">
          <div>
            <Image
              src="/images/logo-white.png"
              alt="Sapphire Water"
              width={1001}
              height={277}
              sizes="160px"
              className="h-[38px] w-auto"
            />
            <p
              className="mt-6 max-w-[22rem]"
              style={{ fontSize: "var(--text-sm)", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}
            >
              Nước uống tinh khiết cao cấp. Pure Life – Pure Water.
            </p>
          </div>

          <nav aria-label="Liên kết chân trang" className="flex flex-wrap gap-x-10 gap-y-4">
            {navItems.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className="footer-link flex items-baseline gap-3"
                style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.78)", fontWeight: 300 }}
              >
                <span style={{ fontSize: "var(--text-xs)", color: "var(--sapphire-light)", letterSpacing: "0.15em" }}>
                  0{i + 1}
                </span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

        <div
          className="flex flex-col md:flex-row justify-between gap-3 py-8"
          style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}
        >
          <p>© {YEAR} Sapphire Water. All rights reserved.</p>
          <p>Nước tinh khiết cao cấp</p>
        </div>
      </div>

      {/* Oversized wordmark sinks below the fold like a reflection */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p
          className="text-center whitespace-nowrap translate-y-[22%]"
          style={{
            fontSize: "clamp(4rem, 17vw, 17rem)",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 0.8,
            color: "rgba(111, 180, 236, 0.07)",
          }}
        >
          Sapphire
        </p>
      </div>

      <style>{`
        .footer-link { transition: color 0.5s var(--ease-out); }
        .footer-link:hover { color: var(--pure-white) !important; }
      `}</style>
    </footer>
  );
}
