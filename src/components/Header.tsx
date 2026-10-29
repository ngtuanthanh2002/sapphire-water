"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { EASE_OUT, EASE_SURFACE } from "@/lib/motion";

const navItems = [
  { label: "Tinh khiết", href: "#essence" },
  { label: "Trải nghiệm", href: "#motion" },
  { label: "Sản phẩm", href: "#product" },
  { label: "Chất lượng", href: "#quality" },
  { label: "Thương hiệu", href: "#brand" },
];

const HEADER_PROBE_Y = 36;

export default function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    if (Math.abs(delta) > 4) setHidden(delta > 0 && y > window.innerHeight * 0.6);
    setSolid(y > 24);

    // Which ground is under the header? Sections opt in with data-header="dark".
    let isDark = false;
    document.querySelectorAll<HTMLElement>("[data-header='dark']").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top <= HEADER_PROBE_Y && r.bottom >= HEADER_PROBE_Y) isDark = true;
    });
    setDark(isDark);
  });

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const onDark = dark && !isMobileMenuOpen;
  const ink = onDark || isMobileMenuOpen ? "var(--pure-white)" : "var(--deep-ocean)";

  return (
    <>
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: hidden && !isMobileMenuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.7, ease: EASE_SURFACE, delay: entered ? 0 : 0.9 }}
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
          <a
            href="#"
            aria-label="Sapphire Water — về đầu trang"
            className="relative block h-[34px] md:h-[40px] aspect-[500/138]"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
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
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 + i * 0.07, ease: EASE_OUT }}
                onClick={(e) => handleNavClick(e, item.href)}
                className="nav-link relative py-1"
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: ink,
                  transition: "color 0.6s var(--ease-out)",
                }}
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          <button
            className="md:hidden relative w-10 h-10 -mr-2 flex flex-col items-center justify-center gap-[6px] bg-transparent border-none cursor-pointer"
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
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.8, ease: EASE_SURFACE }}
            className="fixed inset-0 z-[99] flex flex-col justify-end pb-[14svh]"
            style={{ backgroundColor: "var(--abyss)" }}
          >
            <nav className="container-x flex flex-col gap-2">
              {navItems.map((item, i) => (
                <span key={item.href} className="block overflow-hidden">
                  <motion.a
                    href={item.href}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: EASE_SURFACE }}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="flex items-baseline gap-4"
                    style={{
                      fontSize: "clamp(2.25rem, 11vw, 3.5rem)",
                      fontWeight: 200,
                      color: "var(--pure-white)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.15,
                    }}
                  >
                    <span style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--sapphire-light)", fontWeight: 500 }}>
                      0{i + 1}
                    </span>
                    {item.label}
                  </motion.a>
                </span>
              ))}
            </nav>
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
      `}</style>
    </>
  );
}
