"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { EASE_SURFACE } from "@/lib/motion";
import { FadeUp, RevealLines } from "@/components/ui/Reveal";

/** Polygon whose top edge is a travelling sine wave — the waterline. */
function waterline(level: number, phase: number, amp: number) {
  const n = 32;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    const y = level + amp * Math.sin((x / 100) * Math.PI * 3 + phase);
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")}, 100% 100%, 0% 100%)`;
}

const MANIFESTO = (
  <>
    Nước thuần khiết không chỉ là thức uống — đó là một{" "}
    <em className="not-italic" data-accent>
      trải nghiệm.
    </em>{" "}
    Mỗi giọt Sapphire Water là kết tinh của quy trình tinh lọc hiện đại, trong trẻo tuyệt đối.
  </>
);

/**
 * Motion moment 02 — "Mực nước dâng".
 * The manifesto sits in pale ice; as you scroll, sapphire water rises
 * through the words with a living waveline edge.
 */
export default function EssenceSection() {
  const manifestoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: manifestoRef,
    offset: ["start 0.8", "end 0.4"],
  });
  const level = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.0005 });
  const fillClip = useTransform(level, (v) =>
    waterline(104 - v * 110, v * Math.PI * 5, 3.2 * Math.sin(Math.PI * Math.min(1, v * 1.05)))
  );

  const { scrollYProgress: imgProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(imgProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="essence"
      className="relative bg-white"
      style={{ paddingBlock: "var(--section-pad-y)" }}
    >
      {/* Manifesto */}
      <div className="container-x">
        <div className="mb-10 md:mb-14">
          <span className="eyebrow">
            <i>02</i> Bản chất tinh khiết
          </span>
        </div>

        <div ref={manifestoRef} className="relative max-w-[1180px]">
          <p className="manifesto" style={{ color: "rgba(7, 86, 168, 0.16)" }}>
            {MANIFESTO}
          </p>
          <motion.p
            aria-hidden
            className="manifesto absolute inset-0"
            style={{
              color: "var(--deep-ocean)",
              clipPath: reduce ? "none" : fillClip,
            }}
          >
            {MANIFESTO}
          </motion.p>
        </div>
      </div>

      {/* Editorial spread */}
      <div className="container-x mt-[clamp(6rem,18vh,12rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-14 lg:gap-x-8 items-end">
          <motion.div
            ref={imageRef}
            className="lg:col-span-6 relative overflow-hidden"
            style={{ aspectRatio: "4 / 5", borderRadius: 4 }}
            initial={{ clipPath: "inset(12% 12% 12% 12%)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.6, ease: EASE_SURFACE }}
          >
            <motion.div className="absolute -inset-y-[10%] inset-x-0" style={{ y: imgY }}>
              <Image
                src="/images/water-texture-detail.jpg"
                alt="Giọt nước tinh khiết trên bề mặt trong trẻo"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>

          <div className="lg:col-span-5 lg:col-start-8 lg:pb-6">
            <h2 className="display" style={{ fontSize: "var(--text-5xl)", color: "var(--ink)" }}>
              <RevealLines lines={["Tinh khiết", <b key="b">từng giọt nước</b>]} />
            </h2>

            <FadeUp as="p" className="lede mt-8 max-w-[30rem]" delay={0.2}>
              Mỗi chai Sapphire Water là kết tinh của quy trình tinh lọc hiện đại, mang đến sự
              trong trẻo tuyệt đối — để vị nước tự nói lên phẩm chất của nó.
            </FadeUp>

            <div className="mt-14 grid grid-cols-2">
              {[
                { value: "7.4", label: "pH cân bằng" },
                { value: "TDS", label: "Kiểm soát chặt chẽ" },
              ].map((stat, i) => (
                <FadeUp key={stat.label} delay={0.3 + i * 0.1} className="pt-5 pr-6">
                  <div className="hairline mb-5" />
                  <p
                    style={{
                      fontSize: "var(--text-4xl)",
                      fontWeight: 200,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "var(--sapphire-blue)",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-3 uppercase"
                    style={{ fontSize: "var(--text-xs)", letterSpacing: "0.18em", color: "var(--ink-50)" }}
                  >
                    {stat.label}
                  </p>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .manifesto {
          font-size: clamp(1.625rem, 3.7vw, 3.5rem);
          font-weight: 300;
          line-height: 1.22;
          letter-spacing: -0.025em;
          text-wrap: pretty;
        }
        .manifesto [data-accent] { font-weight: 300; }
        p.manifesto[aria-hidden] [data-accent] { color: var(--sapphire-blue); }
      `}</style>
    </section>
  );
}
