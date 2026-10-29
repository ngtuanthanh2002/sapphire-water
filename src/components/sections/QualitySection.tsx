"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { EASE_OUT, EASE_SURFACE, SCROLL_SPRING } from "@/lib/motion";
import { FadeUp, RevealLines } from "@/components/ui/Reveal";
import { NIGHT } from "@/components/sections/PuritySection";

/** Where the leaf lets go of its drop, as a fraction of quality-leaf-drop.jpg. */
const TIP = { x: 57.9, y: 53.4 };

const pillars = [
  {
    title: "Nguồn nước chọn lọc",
    body: "Nguồn nước đầu vào được khảo sát và kiểm định kỹ lưỡng trước khi bước vào quy trình xử lý.",
  },
  {
    title: "Công nghệ RO – UV – Ozone",
    body: "Lọc thẩm thấu ngược loại bỏ tạp chất; tia UV và Ozone khử khuẩn, giữ nước trong và an toàn.",
  },
  {
    title: "Khoáng chất cân bằng",
    body: "Bổ sung Canxi (Ca²⁺) và Magie (Mg²⁺) — vị nước mềm, thanh và dễ uống.",
  },
  {
    title: "Chuẩn quốc gia & quốc tế",
    body: "Đáp ứng QCVN 6-1:2010/BYT, vận hành theo hệ thống an toàn thực phẩm ISO 22000:2018.",
  },
];

/**
 * Motion moment 07 — "Thắp sáng".
 * Arriving from the deep, the frame is still dark; as it rises the leaf and
 * its drop light up, the camera settles back from the tip, and the standards
 * line spreads outward from exactly where the drop falls.
 */
export default function QualitySection() {
  const bandRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "center center"],
  });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const dark = useTransform(p, [0.15, 0.95], [0.92, 0]);
  const scale = useTransform(p, [0, 1], [1.22, 1]);

  return (
    <section
      id="quality"
      data-header="dark"
      aria-label="Chất lượng vượt trội"
      className="relative overflow-hidden"
      style={{ backgroundColor: NIGHT, paddingBottom: "var(--section-pad-y)" }}
    >
      {/* Image band — the plate is sized to the photo's own ratio on large
          screens and crops around the drop on narrower ones. */}
      <div ref={bandRef} className="relative w-full overflow-hidden aspect-[4/5] sm:aspect-[16/10] lg:aspect-[2560/1061]">
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { scale, transformOrigin: `${TIP.x}% ${TIP.y}%` }}
        >
          <div className="absolute top-0 h-full aspect-[2560/1061] min-w-full left-1/2 -translate-x-[54%] lg:left-0 lg:translate-x-0">
            <Image
              src="/images/quality-leaf-drop.jpg"
              alt="Chiếc lá phát sáng nhỏ xuống một giọt nước tinh khiết"
              fill
              sizes="(max-width: 1024px) 260vw, 100vw"
              className="object-cover select-none"
              draggable={false}
            />
            {/* The tip breathes */}
            <span
              aria-hidden
              className="quality-tip absolute rounded-full pointer-events-none"
              style={{
                left: `${TIP.x}%`,
                top: `${TIP.y}%`,
                width: "6%",
                aspectRatio: "1",
                translate: "-50% -50%",
                background: "radial-gradient(circle, rgba(140,210,255,0.55) 0%, rgba(140,210,255,0) 60%)",
                mixBlendMode: "screen",
              }}
            />
          </div>
        </motion.div>
        {!reduce && (
          <motion.div aria-hidden className="absolute inset-0" style={{ backgroundColor: NIGHT, opacity: dark }} />
        )}
        {/* Seat the plate in the room */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${NIGHT} 0%, rgba(2,10,20,0) 18%, rgba(2,10,20,0) 72%, ${NIGHT} 100%)`,
          }}
        />

        {/* Headline in the dark left third (large screens) */}
        <div className="hidden lg:flex absolute inset-0 container-x items-center justify-between pointer-events-none">
          <QualityHeading />
          <FadeUp as="p" delay={0.3} className="max-w-[17rem] self-center">
            <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.62)" }}>
              Từ nguồn nước đến từng giọt trong chai — mỗi công đoạn đều được kiểm soát để giữ trọn
              sự tinh khiết tự nhiên.
            </span>
          </FadeUp>
        </div>
      </div>

      <div className="container-x">
        <div className="lg:hidden -mt-[8svh] relative">
          <QualityHeading />
          <FadeUp as="p" delay={0.2} className="mt-6 max-w-[26rem]">
            <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.62)" }}>
              Từ nguồn nước đến từng giọt trong chai — mỗi công đoạn đều được kiểm soát để giữ trọn
              sự tinh khiết tự nhiên.
            </span>
          </FadeUp>
        </div>

        {/* Standards line — full bleed, spreads from under the drop */}
        <div className="relative h-px w-screen left-1/2 -translate-x-1/2 mt-16 lg:mt-[clamp(2rem,6vh,4rem)]" aria-hidden>
          {[
            { left: "0%", width: `${TIP.x}%`, origin: "right" },
            { left: `${TIP.x}%`, width: `${100 - TIP.x}%`, origin: "left" },
          ].map(({ left, width, origin }) => (
            <motion.span
              key={origin}
              className="absolute top-0 h-px"
              style={{ left, width, transformOrigin: origin, background: "rgba(111,180,236,0.35)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1.6, ease: EASE_SURFACE }}
            />
          ))}
          <motion.span
            className="absolute -top-[3px] w-[7px] h-[7px] rounded-full"
            style={{ left: `${TIP.x}%`, translate: "-50% 0", background: "var(--sapphire-light)", boxShadow: "0 0 14px 2px rgba(111,180,236,0.6)" }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, ease: EASE_SURFACE }}
          />
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 mt-12">
          {pillars.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1.1, delay: 0.25 + i * 0.1, ease: EASE_OUT }}
            >
              <span
                style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--sapphire-light)", fontVariantNumeric: "tabular-nums" }}
              >
                0{i + 1}
              </span>
              <h3
                className="mt-4"
                style={{ fontSize: "var(--text-xl)", fontWeight: 500, color: "var(--pure-white)", letterSpacing: "-0.01em" }}
              >
                {item.title}
              </h3>
              <p
                className="mt-3 max-w-[22rem]"
                style={{ fontSize: "var(--text-sm)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.55)" }}
              >
                {item.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>

      <style>{`
        .quality-tip { animation: quality-tip 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
        @keyframes quality-tip {
          0%, 100% { opacity: 0.55; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) { .quality-tip { animation: none; } }
      `}</style>
    </section>
  );
}

function QualityHeading() {
  return (
    <div>
      <span className="eyebrow eyebrow--light">
        <i>06</i> Tiêu chuẩn
      </span>
      <h2
        className="display mt-6"
        style={{ fontSize: "var(--text-5xl)", color: "var(--pure-white)" }}
      >
        <RevealLines lines={["Chất lượng", <b key="b">vượt trội</b>]} />
      </h2>
    </div>
  );
}
