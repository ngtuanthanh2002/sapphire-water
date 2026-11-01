"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import AccountMenu from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { EASE_OUT, EASE_SURFACE } from "@/lib/motion";

const navItems = [
  { label: "Tinh khiết", href: "#essence" },
  { label: "Trải nghiệm", href: "#motion" },
  { label: "Sản phẩm", href: "#product" },
  { label: "Chất lượng", href: "#quality" },
  { label: "Thương hiệu", href: "#brand" },
  { label: "Blog", href: "/blog" },
];

const MotionLink = motion.create(Link);

const navLabel: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

const mobileItem: React.CSSProperties = {
  fontSize: "clamp(1.375rem, 5.8vw, 1.75rem)",
  fontWeight: 300,
  color: "var(--pure-white)",
  letterSpacing: "-0.02em",
  lineHeight: 1.3,
};

const mobileIndex: React.CSSProperties = {
  fontSize: "var(--text-xs)",
  letterSpacing: "0.12em",
  color: "var(--sapphire-light)",
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
};

const mobileRule = "rgba(255, 255, 255, 0.12)";

const HEADER_PROBE_Y = 36;

/** Which ground is under the header? Sections opt in with data-header="dark". */
function probeDark() {
  let isDark = false;
  document.querySelectorAll<HTMLElement>("[data-header='dark']").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top <= HEADER_PROBE_Y && r.bottom >= HEADER_PROBE_Y) isDark = true;
  });
  return isDark;
}

// `home` is a prop, not usePathname(): reading the path suspends on /blog/[slug]
// and the header would have to sit behind a Suspense boundary. Only the home
// page plays the entrance and scrolls in place. `startDark` is for pages that
// open on a dark ground, before any scroll event has fired.
export default function Header({ home = false, startDark = false }: { home?: boolean; startDark?: boolean }) {
  const { ready } = useAuth();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(startDark);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    if (Math.abs(delta) > 4) setHidden(delta > 0 && y > window.innerHeight * 0.6);
    setSolid(y > 24);
    setDark(probeDark());
  });

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const hrefFor = (href: string) => (home || !href.startsWith("#") ? href : `/${href}`);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setIsMobileMenuOpen(false);
    if (!home || !href.startsWith("#")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const onDark = dark && !isMobileMenuOpen;
  const ink = onDark || isMobileMenuOpen ? "var(--pure-white)" : "var(--deep-ocean)";

  return (
    <>
      <motion.header
        initial={home ? { y: "-100%" } : false}
        animate={{ y: hidden && !isMobileMenuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE_SURFACE, delay: home && !entered ? 0.9 : 0 }}
        onAnimationComplete={() => setEntered(true)}
        className="fixed top-0 left-0 right-0 z-[100]"
      >
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: solid && !isMobileMenuOpen ? 1 : 0,
            background: onDark ? "rgba(4, 29, 56, 0.72)" : "rgba(255, 255, 255, 0.78)",
            backdropFilter: "blur(18px) saturate(1.4)",
            WebkitBackdropFilter: "blur(18px) saturate(1.4)",
            borderBottom: `1px solid ${onDark ? "rgba(255,255,255,0.08)" : "var(--ink-08)"}`,
            transitionTimingFunction: "var(--ease-out)",
          }}
        />
        <nav
          className="container-x relative flex items-center justify-between transition-[padding] duration-700"
          style={{
            paddingBlock: solid ? "0.9rem" : "1.5rem",
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          <Link
            href="/"
            aria-label="Sapphire Water — về đầu trang"
            className="relative block h-[34px] md:h-[40px] aspect-[500/138]"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (!home) return;
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Image
              src="/images/logo.svg"
              alt="Sapphire Water"
              fill
              preload
              className="object-contain transition-opacity duration-500"
              style={{ opacity: onDark || isMobileMenuOpen ? 0 : 1 }}
            />
            <Image
              src="/images/logo-white.png"
              alt=""
              fill
              sizes="160px"
              className="object-contain transition-opacity duration-500"
              style={{ opacity: onDark || isMobileMenuOpen ? 1 : 0 }}
            />
          </Link>

          <div className="flex items-center gap-8 xl:gap-10">
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navItems.map((item, i) => (
                <MotionLink
                  key={item.href}
                  href={hrefFor(item.href)}
                  initial={home ? { opacity: 0, y: -8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 + i * 0.07, ease: EASE_OUT }}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="nav-link relative py-1"
                  style={{ ...navLabel, color: ink, transition: "color 0.6s var(--ease-out)" }}
                >
                  {item.label}
                </MotionLink>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {/* Held invisible until the session is known, so an admin never sees the wrong state flash. */}
              <motion.div
                className="lg:-mr-2"
                initial={home ? { opacity: 0, y: -8 } : false}
                animate={{ opacity: ready ? 1 : 0, y: 0 }}
                transition={{ duration: 0.8, delay: home ? 1.1 + navItems.length * 0.07 : 0, ease: EASE_OUT }}
                style={{ pointerEvents: ready ? "auto" : "none" }}
              >
                <AccountMenu color={ink} onNavigate={() => setIsMobileMenuOpen(false)} />
              </motion.div>

              <button
                className="lg:hidden relative w-10 h-10 -mr-2 flex flex-col items-center justify-center gap-[6px] bg-transparent border-none cursor-pointer"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {[1, -1].map((dir) => (
                  <motion.span
                    key={dir}
                    className="block w-6 h-[1.5px] origin-center"
                    style={{ backgroundColor: ink }}
                    animate={{
                      rotate: isMobileMenuOpen ? 45 * dir : 0,
                      y: isMobileMenuOpen ? 3.75 * dir : 0,
                    }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                  />
                ))}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.8, ease: EASE_SURFACE }}
            className="fixed inset-0 z-[99] flex flex-col overflow-y-auto"
            style={{ backgroundColor: "var(--abyss)" }}
          >
            <Image
              src="/images/hero-water-bg.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-20"
              style={{
                mixBlendMode: "soft-light",
                maskImage: "linear-gradient(180deg, transparent 35%, black 100%)",
                WebkitMaskImage: "linear-gradient(180deg, transparent 35%, black 100%)",
              }}
            />

            <nav className="container-x relative pt-[6.5rem]">
              <ul style={{ borderTop: `1px solid ${mobileRule}` }}>
                {navItems.map((item, i) => (
                  <li key={item.href} className="overflow-hidden" style={{ borderBottom: `1px solid ${mobileRule}` }}>
                    <MotionLink
                      href={hrefFor(item.href)}
                      initial={{ y: "105%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "105%" }}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: EASE_SURFACE }}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="mobile-link flex items-center gap-4 py-[1.05rem]"
                      style={mobileItem}
                    >
                      <span className="w-7 shrink-0" style={mobileIndex}>
                        0{i + 1}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight size={18} strokeWidth={1.25} aria-hidden className="shrink-0 opacity-50" />
                    </MotionLink>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT }}
              className="container-x relative mt-auto pt-10 pb-[max(2rem,env(safe-area-inset-bottom))]"
              style={{ fontSize: "var(--text-sm)", fontWeight: 300, color: "rgba(255,255,255,0.6)" }}
            >
              Pure Life – Pure Water
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.6s var(--ease-out);
        }
        .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .account-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border: 0;
          border-radius: 999px;
          background: transparent;
          cursor: pointer;
          transition: background-color 0.4s var(--ease-out), color 0.6s var(--ease-out);
        }
        .account-btn:hover { background-color: rgba(111, 180, 236, 0.18); }
        .mobile-link { transition: color 0.3s var(--ease-out); }
        .mobile-link:hover, .mobile-link:active { color: var(--sapphire-light) !important; }
      `}</style>
    </>
  );
}
