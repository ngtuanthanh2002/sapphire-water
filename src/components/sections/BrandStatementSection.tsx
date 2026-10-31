"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { FadeUp, RevealLines } from "@/components/ui/Reveal";

/** The statement says no explanation is needed; the campaign image opens wide and proves it. */
function CampaignBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.5"],
  });
  const inset = useTransform(scrollYProgress, [0.1, 1], [9, 0]);
  const radius = useTransform(scrollYProgress, [0.1, 1], [6, 0]);
  const clip = useMotionTemplate`inset(0% ${inset}% round ${radius}px)`;
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden w-full"
      style={{ aspectRatio: "1672 / 941", ...(reduce ? {} : { clipPath: clip }) }}
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { scale }}>
        <Image
          src="/images/campaign-banner.png"
          alt="Sapphire Water — Pure Life, Pure Water: chai nước giữa làn nước tung bọt trên hồ núi"
          fill
          className="object-cover select-none"
          sizes="100vw"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}

const W = 1440;
const H = 140;

/** Wave path across the full width; `amp` 0 → flat (settled tide). */
function tide(amp: number, phase: number) {
  const n = 48;
  let d = `M0 ${H} `;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * W;
    const t = i / n;
    const y =
      H -
      amp * H * 0.85 * (0.55 + 0.3 * Math.sin(t * Math.PI * 2.2 + phase) + 0.15 * Math.sin(t * Math.PI * 5.3 - phase * 1.7));
    d += `L${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d + `L${W} ${H} Z`;
}

/**
 * Motion moment 05 — "Thủy triều".
 * The deep-sapphire statement arrives as a tide: its surface heaves on entry
 * and settles flat as the words surface.
 */
export default function BrandStatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.25"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 24, restDelta: 0.0005 });
  const wave = useTransform(p, (v) => tide(Math.max(0, 1 - v) ** 1.4, v * Math.PI * 3));

  return (
    <section
      ref={sectionRef}
      id="brand"
      data-header="dark"
      className="relative"
      style={{ backgroundColor: "var(--deep-ocean)" }}
    >
      {!reduce && (
        <svg
          aria-hidden
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute left-0 w-full bottom-[calc(100%-1px)] pointer-events-none"
          style={{ height: "clamp(56px, 9vw, 140px)" }}
        >
          <motion.path d={wave} fill="var(--deep-ocean)" />
        </svg>
      )}

      <div
        className="container-x relative flex flex-col items-center text-center"
        style={{ paddingBlock: "clamp(7rem, 22vh, 14rem)" }}
      >
        <FadeUp>
          <Image src="/images/icon-white.png" alt="" width={44} height={44} className="opacity-90" />
        </FadeUp>

        <p
          className="mt-10 uppercase"
          style={{ fontSize: "var(--text-xs)", letterSpacing: "0.3em", color: "var(--sapphire-light)", fontWeight: 500 }}
        >
          <span style={{ opacity: 0.6 }}>10</span>&nbsp;&nbsp;Thông điệp thương hiệu
        </p>

        <h2
          className="display mt-8"
          style={{ fontSize: "var(--text-6xl)", color: "var(--pure-white)", maxWidth: "15ch" }}
        >
          <RevealLines
            lines={[
              "Sự thuần khiết",
              <b key="b" style={{ color: "var(--sapphire-light)" }}>
                không cần
              </b>,
              <b key="c" style={{ color: "var(--sapphire-light)" }}>
                lời giải thích.
              </b>,
            ]}
          />
        </h2>

        <FadeUp
          as="p"
          delay={0.4}
          className="mt-12 max-w-[34rem]"
        >
          <span style={{ fontSize: "var(--text-base)", fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.62)" }}>
            Sapphire Water — nơi mỗi giọt nước mang trong mình sự trong trẻo của thiên nhiên và cam
            kết về chất lượng tuyệt đối.
          </span>
        </FadeUp>
      </div>

      <CampaignBanner />
    </section>
  );
}
