"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { FadeUp, RevealLines } from "@/components/ui/Reveal";

const CAPTION = { fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--ink-50)" } as const;

/** Reads the climb between the two frames: ground level to cruising altitude. */
function Altimeter({ p }: { p: MotionValue<number> }) {
  const top = useTransform(p, (v) => `${(1 - v) * 100}%`);
  const reading = useTransform(p, (v) => `${(Math.round(v * 100) * 100).toLocaleString("vi-VN")} m`);

  return (
    <div aria-hidden className="hidden lg:block relative shrink-0 w-[clamp(5rem,7vw,6.5rem)]">
      <span className="absolute inset-y-0 left-1/2 w-px" style={{ background: "var(--ink-15)" }} />
      <motion.span
        className="absolute inset-y-0 left-1/2 w-px origin-bottom"
        style={{ scaleY: p, background: "var(--sapphire-blue)" }}
      />
      <motion.span
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 py-1.5 bg-white whitespace-nowrap"
        style={{
          top,
          fontSize: "var(--text-xs)",
          letterSpacing: "0.06em",
          fontVariantNumeric: "tabular-nums",
          color: "var(--sapphire-blue)",
        }}
      >
        {reading}
      </motion.span>
    </div>
  );
}

/**
 * Motion moment — "Từ mặt đất đến tầng mây".
 * Two frames share one height, each shown whole. The cabin frame takes off and
 * settles level with the sky as the altimeter climbs. Tied to scroll, no spring.
 */
export default function MomentsSection() {
  const rowRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 0.92", "end 0.92"],
  });
  const settled = useMotionValue(1);
  const p = reduce ? settled : scrollYProgress;

  const skyY = useTransform(p, [0, 0.8], ["5%", "0%"]);
  const skyScale = useTransform(p, [0, 1], [1.06, 1]);
  const cabinY = useTransform(p, [0, 1], ["18%", "0%"]);

  return (
    <section
      id="moments"
      className="relative bg-white"
      style={{
        paddingTop: "clamp(2rem, 6vh, 4rem)",
        paddingBottom: "calc(var(--section-pad-y) + clamp(56px, 9vw, 140px))",
      }}
    >
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 items-end">
          <div className="lg:col-span-7">
            <span className="eyebrow">
              <i>09</i> Khoảnh khắc
            </span>
            <h2 className="display mt-6" style={{ fontSize: "var(--text-5xl)", color: "var(--ink)" }}>
              <RevealLines lines={["Từ mặt đất", <b key="b">đến tầng mây</b>]} />
            </h2>
          </div>
          <FadeUp as="p" className="lede lg:col-span-4 lg:col-start-9 lg:pb-3" delay={0.2}>
            Một ngụm mát lành dưới nắng, hay một chai nước trong tay trên chuyến bay dài — Sapphire
            Water đi cùng bạn đến bất cứ đâu.
          </FadeUp>
        </div>

        {/* Flex ratios equal each photo's aspect ratio, so both frames land on the same height */}
        <div
          ref={rowRef}
          className="flex flex-col sm:flex-row gap-y-16 sm:gap-x-6 lg:gap-x-0 mt-[clamp(3rem,8vh,5rem)]"
        >
          <motion.figure className="relative min-w-0 sm:flex-[1.499_1_0%]" style={{ y: skyY }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: "1535 / 1024", borderRadius: 4 }}>
              <motion.div className="absolute inset-0" style={{ scale: skyScale }}>
                <Image
                  src="/images/moment-blue-sky.png"
                  alt="Người phụ nữ uống nước Sapphire Water dưới bầu trời xanh"
                  fill
                  className="object-cover select-none"
                  sizes="(max-width: 640px) 100vw, (max-width: 1440px) 68vw, 980px"
                  draggable={false}
                />
              </motion.div>
            </div>
            <figcaption className="absolute top-full mt-4 uppercase" style={CAPTION}>
              Dưới trời xanh
            </figcaption>
          </motion.figure>

          <Altimeter p={p} />

          <motion.figure className="relative min-w-0 sm:flex-[0.558_1_0%]" style={{ y: cabinY }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: "937 / 1679", borderRadius: 4 }}>
              <Image
                src="/images/moment-in-flight.png"
                alt="Bàn tay cầm chai Sapphire Water bên cửa sổ máy bay"
                fill
                className="object-cover select-none"
                sizes="(max-width: 640px) 100vw, (max-width: 1440px) 26vw, 380px"
                draggable={false}
              />
            </div>
            <figcaption className="absolute top-full mt-4 uppercase" style={CAPTION}>
              Trên tầng mây
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
