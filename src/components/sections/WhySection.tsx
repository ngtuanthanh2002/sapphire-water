"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { SCROLL_SPRING } from "@/lib/motion";
import { RevealLines } from "@/components/ui/Reveal";
import { DROP_PATH, DROP_VIEWBOX } from "@/components/ui/BrandDrop";

const reasons = [
  {
    title: "An tâm cho cả gia đình",
    body: "Nước tinh khiết, khoáng chất cân bằng — phù hợp với mọi thành viên, từ trẻ nhỏ đến người lớn tuổi.",
  },
  {
    title: "Vị nước mềm, thanh",
    body: "Uống mỗi ngày không ngán, giữ trọn hương vị khi pha trà, cà phê hay nấu ăn.",
  },
  {
    title: "Đủ cho mọi khoảnh khắc",
    body: "Chai 500ml đồng hành mỗi ngày; bình 20L cho gia đình và văn phòng, dùng cùng cây nóng lạnh.",
  },
  {
    title: "Thiết kế xứng tầm",
    body: "Từ dáng chai đến nhãn được chăm chút tỉ mỉ — xứng đáng có mặt trên bàn làm việc lẫn bàn tiệc.",
  },
];

// Drop geometry in the mark's own viewBox (172 240 70 98)
const DROP_TOP = 244;
const DROP_BOTTOM = 334;

/** A wave twice the drop's width, scrolled sideways by CSS so it never ends. */
const WAVE = (() => {
  let d = "M100 400 L100 0 ";
  for (let x = 100; x <= 320; x += 2) {
    d += `L${x} ${(Math.sin(((x - 100) / 35) * Math.PI) * 2.2).toFixed(2)} `;
  }
  return d + "L320 400 Z";
})();

/**
 * Motion moment 08 — "Giọt đầy".
 * The brand drop fills one quarter for every reason read; its counter keeps
 * pace. The reasons themselves light up as they reach the reading line.
 */
export default function WhySection() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.62", "end 0.62"],
  });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const level = useTransform(p, [0, 1], [DROP_BOTTOM + 4, DROP_TOP - 6]);
  const [count, setCount] = useState(0);
  useMotionValueEvent(p, "change", (v) => setCount(Math.min(4, Math.floor(v * 4 + 0.02))));

  return (
    <section id="why" className="relative bg-white" style={{ paddingBlock: "var(--section-pad-y)" }}>
      <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-y-14 lg:gap-x-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[18svh]">
            <span className="eyebrow">
              <i>07</i> Lý do
            </span>
            <h2 className="display mt-6 whitespace-nowrap" style={{ fontSize: "clamp(2.75rem, 5vw, 5rem)", color: "var(--ink)" }}>
              <RevealLines lines={["Tại sao chọn", <b key="b">Sapphire?</b>]} />
            </h2>

            <div className="mt-12 hidden lg:flex items-end gap-8">
              <svg viewBox={DROP_VIEWBOX} className="w-[clamp(5.5rem,11vw,9.5rem)] h-auto overflow-visible" aria-hidden>
                <defs>
                  <clipPath id="why-drop">
                    <path d={DROP_PATH} />
                  </clipPath>
                </defs>
                <g clipPath="url(#why-drop)">
                  <rect x="160" y="230" width="100" height="120" fill="var(--ice-blue)" />
                  <motion.g style={{ y: reduce ? DROP_TOP - 6 : level }}>
                    <path d={WAVE} fill="var(--sapphire-blue)" className={reduce ? undefined : "why-wave"} />
                  </motion.g>
                </g>
                <path d={DROP_PATH} fill="none" stroke="var(--ink-15)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
              <p className="pb-2" style={{ color: "var(--ink)" }}>
                <span
                  className="block"
                  style={{ fontSize: "var(--text-4xl)", fontWeight: 200, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
                >
                  0{reduce ? 4 : count}
                  <span style={{ color: "var(--ink-15)" }}>/04</span>
                </span>
                <span
                  className="block mt-3 uppercase"
                  style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--ink-50)" }}
                >
                  Lý do — một giọt đầy
                </span>
              </p>
            </div>
          </div>
        </div>

        <ol ref={listRef} className="lg:col-span-6 lg:col-start-7">
          {reasons.map((r, i) => (
            <Reason key={r.title} index={i} reason={r} p={p} still={reduce ?? false} />
          ))}
        </ol>
      </div>

      <style>{`
        .why-wave { animation: why-wave 5s linear infinite; }
        @keyframes why-wave { to { transform: translateX(-70px); } }
      `}</style>
    </section>
  );
}

function Reason({
  index,
  reason,
  p,
  still,
}: {
  index: number;
  reason: (typeof reasons)[number];
  p: MotionValue<number>;
  still: boolean;
}) {
  // Each reason owns a quarter of the list's progress
  const start = index / reasons.length;
  const opacity = useTransform(p, [start - 0.12, start + 0.06], [0.22, 1]);
  const x = useTransform(p, [start - 0.12, start + 0.06], [24, 0]);
  const line = useTransform(p, [start - 0.08, start + 0.12], [0, 1]);

  return (
    <li className="relative py-[clamp(2.5rem,7vh,4.5rem)]">
      <span className="absolute top-0 inset-x-0 h-px" style={{ background: "var(--ink-08)" }} aria-hidden />
      <motion.span
        aria-hidden
        className="absolute top-0 inset-x-0 h-px origin-left"
        style={{ background: "var(--sapphire-blue)", scaleX: still ? 1 : line }}
      />
      <motion.div className="grid grid-cols-[3.5rem_1fr] gap-x-4" style={still ? undefined : { opacity, x }}>
        <span
          style={{ fontSize: "var(--text-sm)", letterSpacing: "0.12em", color: "var(--sapphire-blue)", fontVariantNumeric: "tabular-nums", paddingTop: "0.6em" }}
        >
          0{index + 1}
        </span>
        <div>
          <h3
            style={{ fontSize: "var(--text-3xl)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-0.025em", color: "var(--ink)" }}
          >
            {reason.title}
          </h3>
          <p
            className="mt-4 max-w-[30rem]"
            style={{ fontSize: "var(--text-base)", lineHeight: 1.8, fontWeight: 300, color: "var(--ink-70)" }}
          >
            {reason.body}
          </p>
        </div>
      </motion.div>
    </li>
  );
}
