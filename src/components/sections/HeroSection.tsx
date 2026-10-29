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
import { BOTTLE, EASE_OUT, EASE_SURFACE, SCROLL_SPRING } from "@/lib/motion";
import LoopVideo from "@/components/ui/LoopVideo";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Motion moment 01 — "The Parting".
 * The bottle *is* the space between "Sapphire" and "Water". On scroll the two
 * words part like water around a hull, while the full-bleed water surface
 * contracts into a framed lens that holds the product.
 */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);

  // Words part outward
  const leftX = useTransform(p, [0, 0.6], ["0vw", "-22vw"]);
  const rightX = useTransform(p, [0, 0.6], ["0vw", "22vw"]);
  const wordsOpacity = useTransform(p, [0.1, 0.5], [1, 0]);
  const wordsBlur = useTransform(p, [0.15, 0.55], ["blur(0px)", "blur(6px)"]);

  // Water surface contracts into a lens
  const insetY = useTransform(p, [0.08, 0.75], [0, 11]);
  const insetX = useTransform(p, [0.08, 0.75], [0, 7]);
  const radius = useTransform(p, [0.08, 0.75], [0, 28]);
  const clip = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${radius}px)`;
  const bgScale = useTransform(p, [0, 0.8], [1.12, 1]);

  // Product settles inside the lens
  const bottleScale = useTransform(p, [0, 0.75], [1, 0.82]);
  const metaOpacity = useTransform(p, [0, 0.18], [1, 0]);
  const captionOpacity = useTransform(p, [0.55, 0.8], [0, 1]);
  const captionY = useTransform(p, [0.55, 0.8], [24, 0]);

  // The parting is a desktop scene. On phones the hero is one plain screen
  // that simply scrolls away — no pin, no lens.
  const desktop = useMediaQuery("(min-width: 768px)", true);
  const still = (reduce ?? false) || !desktop;

  return (
    <section
      ref={sectionRef}
      aria-label="Sapphire Water"
      className={`relative min-h-[620px] ${reduce ? "h-[100svh]" : "h-[100svh] md:h-[210svh]"}`}
    >
      <div
        className="sticky top-0 h-[100svh] min-h-[620px] w-full overflow-hidden bg-white select-none"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: "none" }}
      >
        {/* Water surface → lens */}
        <motion.div
          className="absolute inset-0 overflow-hidden will-change-[clip-path]"
          style={still ? undefined : { clipPath: clip }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.4, ease: EASE_OUT }}
          >
            <motion.div className="absolute inset-0" style={still ? undefined : { scale: bgScale }}>
              {/* Seamless loop (tail cross-faded into head), slowed to breathe;
                  its exact first frame stands in until it plays. */}
              <LoopVideo
                src="/video/web/hero-water.mp4"
                poster="/video/web/hero-water-poster.jpg"
                rate={0.8}
                eager
                rootMargin="0px"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </motion.div>
          </motion.div>
          {/* Light wash keeps the navy type crisp on the bright surface */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(234,246,252,0.6) 100%)",
            }}
          />
        </motion.div>

        {/* Wordmark + bottle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-[2svh] md:gap-[1.6vw]">
            <motion.div
              style={still ? undefined : { x: leftX, opacity: wordsOpacity, filter: wordsBlur }}
              className="order-1"
            >
              <span className="block overflow-hidden pb-[0.12em]">
                <motion.span
                  className="hero-word block"
                  style={{ fontWeight: 200 }}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.5, delay: 0.35, ease: EASE_SURFACE }}
                >
                  Sapphire
                </motion.span>
              </span>
            </motion.div>

            <motion.div
              className="order-2 relative"
              style={still ? undefined : { scale: bottleScale }}
            >
              <motion.div
                initial={{ clipPath: "inset(100% 0% 0% 0%)", y: "6%" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", y: "0%" }}
                transition={{ duration: 1.8, delay: 0.15, ease: EASE_SURFACE }}
              >
                <Image
                  src={BOTTLE.src}
                  alt="Chai nước Sapphire Water"
                  width={BOTTLE.width}
                  height={BOTTLE.height}
                  preload
                  sizes="(max-width: 768px) 40vw, 260px"
                  className="hero-bottle w-auto select-none"
                  draggable={false}
                />
              </motion.div>
              {/* Contact shadow grounds the product on the surface */}
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -bottom-[1.2%] w-[120%] h-[3%] rounded-[50%] pointer-events-none"
                style={{ background: "rgba(6,43,82,0.22)", filter: "blur(10px)" }}
              />
            </motion.div>

            <motion.div
              style={still ? undefined : { x: rightX, opacity: wordsOpacity, filter: wordsBlur }}
              className="order-3"
            >
              <span className="block overflow-hidden pb-[0.12em]">
                <motion.span
                  className="hero-word block"
                  style={{ fontWeight: 600 }}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: EASE_SURFACE }}
                >
                  Water
                </motion.span>
              </span>
            </motion.div>
          </div>
        </div>

        {/* Corner meta — editorial framing */}
        <motion.div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={still ? undefined : { opacity: metaOpacity }}
        >
          <motion.div
            className="container-x flex items-end justify-between pb-[5svh] gap-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.3, ease: EASE_OUT }}
          >
            <p className="lede max-w-[17rem] hidden sm:block" style={{ color: "var(--ink)" }}>
              Sự thuần khiết hoàn hảo, được tinh lọc từ thiên nhiên.
            </p>
            <div className="flex items-center gap-4 ml-auto">
              <span
                className="uppercase"
                style={{ fontSize: "var(--text-xs)", letterSpacing: "0.24em", color: "var(--ink-70)" }}
              >
                Khám phá
              </span>
              <span className="relative block w-px h-12 overflow-hidden" style={{ background: "var(--ink-15)" }}>
                <span className="scroll-cue absolute inset-x-0 top-0 h-1/2" style={{ background: "var(--ink)" }} />
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.p
          className="absolute left-[var(--section-pad-x)] top-[15svh] eyebrow hidden md:inline-flex"
          style={still ? undefined : { opacity: metaOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <i>N°01</i> Pure Life – Pure Water
        </motion.p>

        {/* Caption revealed once the product sits inside the lens */}
        <motion.div
          className="absolute inset-x-0 bottom-[12.5svh] pointer-events-none hidden md:block"
          style={still ? { opacity: 0 } : { opacity: captionOpacity, y: captionY }}
        >
          <div className="mx-auto flex justify-between" style={{ width: "86vw", padding: "0 3vw" }}>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>
              <i>pH</i> 7.4 cân bằng
            </span>
            <span className="eyebrow" style={{ color: "var(--ink)" }}>
              Tinh lọc đa tầng
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .hero-word {
          font-size: clamp(4.25rem, 19vw, 7rem);
          line-height: 0.9;
          letter-spacing: -0.045em;
          color: var(--deep-ocean);
          white-space: nowrap;
        }
        .hero-bottle { height: min(52svh, 520px); }
        @media (min-width: 768px) {
          .hero-word { font-size: clamp(5rem, 9.6vw, 11rem); }
          .hero-bottle { height: min(76svh, 820px); }
        }
        .scroll-cue { animation: scroll-cue 2.4s cubic-bezier(0.65,0,0.35,1) infinite; }
        @keyframes scroll-cue {
          0% { transform: translateY(-100%); }
          60%, 100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
