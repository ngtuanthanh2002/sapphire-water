"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { SCROLL_SPRING } from "@/lib/motion";
import LoopVideo from "@/components/ui/LoopVideo";
import { RevealLines, ScrollLine } from "@/components/ui/Reveal";

/** Matches the vignette edge of MT.jpg, so the dive ends inside the next room. */
export const NIGHT = "#020A14";

/**
 * Motion moment 06 — "Lặn sâu".
 * The footage sits exactly on the waterline: the headline is split by it —
 * "Vẻ đẹp của" in the air, "sự thuần khiết" refracted under the surface.
 * Scrolling takes us down: the surface drifts up, the water deepens to night,
 * and the manifesto surfaces in the dark.
 */
export default function PuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Entry: the framed plate opens to full bleed as the section arrives
  const { scrollYProgress: entry } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const e = useSpring(entry, SCROLL_SPRING);
  const insetT = useTransform(e, [0.2, 1], [16, 0]);
  const insetX = useTransform(e, [0.2, 1], [5, 0]);
  const radius = useTransform(e, [0.2, 1], [6, 0]);
  const plateClip = useMotionTemplate`inset(${insetT}% ${insetX}% 0% ${insetX}% round ${radius}px)`;

  // The dive
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const sink = useTransform(p, [0, 1], ["0%", "-14%"]);
  const depth = useTransform(p, [0.3, 0.72, 1], [0, 0.74, 1]);

  // Headline parts at the waterline: air rises, water sinks
  const airY = useTransform(p, [0, 0.42], ["0svh", "-7svh"]);
  const waterY = useTransform(p, [0, 0.42], ["0svh", "5svh"]);
  const headOpacity = useTransform(p, [0.24, 0.42], [1, 0]);

  // Manifesto in the deep
  const markOpacity = useTransform(p, [0.44, 0.52], [0, 1]);
  const markScale = useTransform(p, [0.44, 0.56], [0.85, 1]);
  const signOpacity = useTransform(p, [0.6, 0.66], [0, 1]);

  useMotionValueEvent(depth, "change", (v) => {
    const el = stageRef.current;
    if (el) el.dataset.header = v > 0.4 ? "dark" : "light";
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="purity-title"
      className="relative"
      style={{ height: reduce ? "auto" : "280svh", backgroundColor: NIGHT }}
    >
      {/* Refraction for the line that sits under the surface */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="purity-refract" x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="2" seed="4">
            {!reduce && (
              <animate
                attributeName="baseFrequency"
                dur="11s"
                values="0.006 0.03;0.009 0.036;0.006 0.03"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div
        ref={stageRef}
        data-header="light"
        className={`${reduce ? "relative" : "sticky"} top-0 h-[100svh] min-h-[560px] w-full overflow-hidden bg-[var(--ice-blue)]`}
      >
        {/* Footage: framed plate → full bleed, then sinks */}
        <motion.div className="absolute inset-0 overflow-hidden" style={reduce ? undefined : { clipPath: plateClip }}>
          <motion.div className="absolute inset-x-0 -top-[6%] h-[124%]" style={reduce ? undefined : { y: sink }}>
            <LoopVideo
              src="/video/web/surface-depth.mp4"
              poster="/video/web/surface-depth-poster.jpg"
              rate={0.75}
              rootMargin="60% 0px 60% 0px"
              className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
            />
          </motion.div>
          {/* Air stays bright for navy type; the water reads deeper toward the floor */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 28%, rgba(6,43,82,0) 52%, rgba(6,43,82,0.5) 100%)",
            }}
          />
          {/* Descent */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundColor: NIGHT, opacity: reduce ? 0 : depth }}
          />
        </motion.div>

        {/* Act I — headline split by the waterline */}
        <motion.div
          className="absolute inset-0 container-x pointer-events-none"
          style={reduce ? undefined : { opacity: headOpacity }}
        >
          <motion.div className="absolute top-[12svh]" style={reduce ? undefined : { y: airY }}>
            <span className="eyebrow">
              <i>05</i> Sự tinh tế trong từng chi tiết
            </span>
            <h2
              id="purity-title"
              className="display mt-6"
              style={{ fontSize: "var(--text-5xl)", color: "var(--ink)" }}
            >
              <RevealLines lines={["Vẻ đẹp của"]} />
              <span className="sr-only"> sự thuần khiết</span>
            </h2>
          </motion.div>

          <motion.div
            aria-hidden
            className="absolute bottom-[10svh] left-[var(--section-pad-x)] right-[var(--section-pad-x)]"
            style={reduce ? undefined : { y: waterY }}
          >
            <p
              className="display"
              style={{
                fontSize: "var(--text-6xl)",
                color: "var(--pure-white)",
                filter: reduce ? undefined : "url(#purity-refract)",
              }}
            >
              <RevealLines delay={0.15} lines={[<b key="b">sự thuần khiết</b>]} />
            </p>
            <div
              className="mt-6 flex justify-between gap-6 uppercase"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}
            >
              <span>Fig. 05 — Ranh giới của không khí và nước</span>
              <span className="hidden sm:inline">Sapphire Water</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Act II — the manifesto, in the deep */}
        {!reduce && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <blockquote className="container-x text-center lg:whitespace-nowrap">
              <motion.span
                aria-hidden
                className="block select-none"
                style={{
                  opacity: markOpacity,
                  scale: markScale,
                  fontSize: "clamp(4rem, 8vw, 7rem)",
                  fontWeight: 200,
                  lineHeight: 0.6,
                  color: "var(--sapphire-light)",
                }}
              >
                &ldquo;
              </motion.span>
              <p
                className="mt-8"
                style={{
                  fontSize: "clamp(1.375rem, 3.4vw, 3rem)",
                  textWrap: "balance",
                  fontWeight: 300,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: "var(--pure-white)",
                }}
              >
                <ScrollLine p={p} at={0.48} span={0.07}>
                  Chúng tôi không chỉ cung cấp nước uống —
                </ScrollLine>
                <ScrollLine p={p} at={0.52} span={0.07}>
                  chúng tôi mang đến{" "}
                  <span style={{ color: "var(--sapphire-light)", fontWeight: 500 }}>tiêu chuẩn mới</span>
                </ScrollLine>
                <ScrollLine p={p} at={0.56} span={0.07}>
                  cho sự tinh khiết.
                </ScrollLine>
              </p>
              <motion.footer
                className="mt-10 uppercase"
                style={{ opacity: signOpacity, fontSize: "var(--text-xs)", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)" }}
              >
                — Sapphire Water
              </motion.footer>
            </blockquote>
          </div>
        )}
      </div>

      {reduce && (
        <blockquote className="container-x text-center py-32" data-header="dark">
          <p style={{ fontSize: "var(--text-3xl)", fontWeight: 300, lineHeight: 1.3, color: "var(--pure-white)" }}>
            Chúng tôi không chỉ cung cấp nước uống — chúng tôi mang đến{" "}
            <span style={{ color: "var(--sapphire-light)" }}>tiêu chuẩn mới</span> cho sự tinh khiết.
          </p>
        </blockquote>
      )}
    </section>
  );
}
