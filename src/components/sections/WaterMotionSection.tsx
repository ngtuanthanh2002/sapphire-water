"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  transform,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { BOTTLE } from "@/lib/motion";
import LoopVideo from "@/components/ui/LoopVideo";
import { ScrollLine } from "@/components/ui/Reveal";
import BrandDrop from "@/components/ui/BrandDrop";

type Chapter = {
  index: string;
  kicker: string;
  title: [string, string];
  body: string;
  alt: string;
  frame: string;
} & ({ image: string } | { video: string; poster: string });

const chapters: Chapter[] = [
  {
    index: "01",
    kicker: "Chuyển động",
    title: ["Dòng chảy", "bất tận"],
    body: "Như dòng nước không ngừng chuyển động, Sapphire Water mang đến nguồn sống thuần khiết trong từng khoảnh khắc.",
    image: "/images/water-flow-abstract.jpg",
    alt: "Dòng nước chuyển động mượt mà",
    frame: "chapter-frame--wide",
  },
  {
    index: "02",
    kicker: "Khoảnh khắc",
    title: ["Mỗi giọt,", "một kiệt tác"],
    body: "Khoảnh khắc một giọt nước chạm mặt hồ — trọn vẹn, tinh khôi và không lặp lại.",
    video: "/video/web/drop-closeup.mp4",
    poster: "/video/web/drop-closeup-poster.jpg",
    alt: "Giọt nước rơi chạm mặt nước cận cảnh",
    frame: "chapter-frame--tall",
  },
];

function ChapterFrame({
  chapter,
  drift,
}: {
  chapter: Chapter;
  drift: MotionValue<string>;
}) {
  return (
    <article className="chapter flex flex-col md:flex-row md:items-end gap-6 md:gap-10 shrink-0">
      <div className={`chapter-frame ${chapter.frame} relative overflow-hidden shrink-0`}>
        <motion.div className="absolute inset-y-0 -inset-x-[12%]" style={{ x: drift }}>
          {"video" in chapter ? (
            <LoopVideo
              src={chapter.video}
              poster={chapter.poster}
              sizes="(max-width: 768px) 80vw, 40vw"
              label={chapter.alt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={chapter.image}
              alt={chapter.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 55vw"
            />
          )}
        </motion.div>
      </div>
      <div className="max-w-[20rem] pb-2">
        <span className="eyebrow eyebrow--light">
          <i>{chapter.index}</i> {chapter.kicker}
        </span>
        <h3
          className="display mt-5"
          style={{ fontSize: "var(--text-3xl)", color: "var(--pure-white)", lineHeight: 1.05 }}
        >
          {chapter.title[0]}
          <br />
          <b>{chapter.title[1]}</b>
        </h3>
        <p
          className="mt-5"
          style={{ fontSize: "var(--text-sm)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.62)" }}
        >
          {chapter.body}
        </p>
      </div>
    </article>
  );
}

/*
 * Timeline, authored in svh of pinned scroll so beats keep their real length
 * whatever the section height. The finale keeps its own 0.57 → 1 clock.
 */
const SCROLL = 599; // section height − one screen
const at = (svh: number) => svh / SCROLL;
const FINALE_FROM = at(369);
/** Finale clock against scroll: its 0.76 → 0.85 reading pause is kept short so the scene never stalls. */
const FINALE = { clock: [0.57, 0.76, 0.85, 1], scroll: [FINALE_FROM, at(487), at(507), 1] };
const fin = (x: number) => transform(x, FINALE.clock, FINALE.scroll);
/** One unbroken pan with no rests, so the scene never sits still under the wheel. */
const TRACK = { from: at(100), to: at(355), out: [at(355), at(380)] } as const;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** Liquid settle: overshoots ~4% then rests. */
const easeOutBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

/** One concentric ripple that births the halo. */
function Ring({ p, start }: { p: MotionValue<number>; start: number }) {
  const scale = useTransform(p, [start, start + 0.075], [0.15, 1.7], { ease: easeOutCubic });
  const opacity = useTransform(p, [start, start + 0.012, start + 0.075], [0, 0.6, 0]);
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: "calc(min(30svh, 40vw) * 2)",
        height: "calc(min(30svh, 40vw) * 2)",
        marginLeft: "calc(min(30svh, 40vw) * -1)",
        marginTop: "calc(min(30svh, 40vw) * -1)",
        border: "1px solid rgba(234, 246, 252, 0.7)",
        scale,
        opacity,
      }}
    />
  );
}

/**
 * Chapter 03 — "Tinh hoa". Ripples birth an ice halo; the bottle fills from
 * the base up, a highlight sweeps its silhouette, the words surface, and the
 * camera finally pushes through the bottle as the halo floods the screen.
 */
function Finale({ p }: { p: MotionValue<number> }) {
  // Halo: born at 0.6, settles by 0.67, floods 0.87 → 0.93
  const halo = useTransform(p, [0.6, 0.67], [0, 1], { ease: easeOutBack });
  const haloGrow = useTransform(p, [0.87, 0.93], [0, 120], { ease: (t) => t * t });
  const haloClip = useMotionTemplate`circle(calc(min(30svh, 40vw) * ${halo} + ${haloGrow}vmax) at 50% 50%)`;

  // Giant outlined word drifting behind
  const giantX = useTransform(p, [0.57, 0.95], ["22vw", "-22vw"]);
  const giantOpacity = useTransform(p, [0.58, 0.65, 0.85, 0.89], [0, 1, 1, 0]);

  // Bottle: fills from the base up, floats, then the camera pushes through it
  const fill = useTransform(p, [0.63, 0.72], [100, 0], { ease: easeOutCubic });
  const fillClip = useMotionTemplate`inset(${fill}% -10% -10% -10%)`;
  const bottleY = useTransform(p, [0.63, 0.72], ["10%", "0%"], { ease: easeOutCubic });
  const pushScale = useTransform(p, [0.87, 0.93], [1, 1.7], { ease: (t) => t * t });
  const pushBlur = useTransform(p, [0.87, 0.93], ["blur(0px)", "blur(10px)"]);
  const pushOpacity = useTransform(p, [0.88, 0.93], [1, 0]);

  // Specular sweep across the silhouette
  const shine = useTransform(p, [0.7, 0.84], ["110%", "-10%"]);

  // Copy
  const kickerOpacity = useTransform(p, [0.66, 0.69], [0, 1]);
  const kickerX = useTransform(p, [0.66, 0.7], [-16, 0], { ease: easeOutCubic });
  const paraOpacity = useTransform(p, [0.71, 0.76], [0, 1]);
  const paraY = useTransform(p, [0.71, 0.76], [16, 0]);
  const copyOut = useTransform(p, [0.85, 0.89], [1, 0]);
  const copyOutY = useTransform(p, [0.85, 0.89], [0, -28]);

  return (
    <>
      {/* Giant word, behind the halo */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] whitespace-nowrap pointer-events-none select-none"
        style={{
          x: giantX,
          opacity: giantOpacity,
          fontSize: "clamp(7rem, 24vw, 26rem)",
          fontWeight: 600,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(111, 180, 236, 0.17)",
        }}
      >
        Tinh hoa
      </motion.div>

      {/* Ripples, then the ice halo (which later becomes the next room) */}
      <div className="absolute inset-0 z-[4] pointer-events-none">
        {[0.575, 0.595, 0.615].map((s) => (
          <Ring key={s} p={p} start={s} />
        ))}
      </div>
      <motion.div
        className="absolute inset-0 z-[4]"
        style={{ clipPath: haloClip, backgroundColor: "var(--ice-blue)" }}
      />

      {/* Bottle */}
      <motion.div
        className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none"
        style={{ scale: pushScale, filter: pushBlur, opacity: pushOpacity }}
      >
        <motion.div style={{ y: bottleY, clipPath: fillClip }}>
          <div className="finale-float relative">
            <Image
              src={BOTTLE.src}
              alt="Sản phẩm Sapphire Water 500ml"
              width={BOTTLE.width}
              height={BOTTLE.height}
              sizes="220px"
              className="w-auto h-[42svh] xl:h-[min(54svh,560px)] select-none"
              draggable={false}
            />
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 60%)",
                backgroundSize: "300% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPositionX: shine,
                WebkitMaskImage: "url(/images/product-500ml-mask.png)",
                maskImage: "url(/images/product-500ml-mask.png)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                mixBlendMode: "screen",
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Copy */}
      <motion.div
        className="absolute inset-0 z-[6] pointer-events-none"
        style={{ opacity: copyOut, y: copyOutY }}
      >
        <div className="w-full px-[var(--section-pad-x)] h-full flex flex-col xl:flex-row justify-end xl:justify-between xl:items-center pb-[9svh] xl:pb-0 gap-4">
          <div className="finale-copy-col whitespace-nowrap">
            <motion.span className="eyebrow eyebrow--light" style={{ opacity: kickerOpacity, x: kickerX }}>
              <i>03</i> Tinh hoa
            </motion.span>
            <h3
              className="finale-copy display mt-5"
              style={{ color: "var(--pure-white)", lineHeight: 1.04 }}
            >
              <ScrollLine p={p} at={0.665}>Nước tinh khiết,</ScrollLine>
              <ScrollLine p={p} at={0.69}>
                <b>thiết kế</b>
              </ScrollLine>
              <ScrollLine p={p} at={0.705}>
                <b>hoàn hảo.</b>
              </ScrollLine>
            </h3>
          </div>
          <motion.p
            style={{ opacity: paraOpacity, y: paraY, fontSize: "var(--text-sm)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.7)" }}
            className="max-w-[17rem] hidden xl:block"
          >
            Chai Sapphire Water được thiết kế chỉn chu từ hình dáng đến nhãn hiệu — phản ánh phẩm
            chất bên trong.
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}

/**
 * Motion moment 03 — "Giọt rơi & dòng chảy".
 * A single brand drop falls onto the white page; its impact floods the screen
 * in deep sapphire. Chapters then travel horizontally like a current, and the
 * scene resolves into an ice halo around the bottle that becomes the next room.
 */
export default function WaterMotionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Scroll-tied directly — no spring, so the slide tracks the wheel 1:1.
  const p = scrollYProgress;

  // Measured, not guessed: the last chapter centred on screen (clamped to the
  // end of the track), plus the full track distance.
  const stops = useMotionValue<[number, number]>([0, 0]);
  const staticDrift = useMotionValue("0%");
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      // clientWidth, not innerWidth: the stage excludes the page scrollbar.
      const vw = stageRef.current?.clientWidth ?? window.innerWidth;
      const max = Math.max(0, track.scrollWidth - vw);
      const base = track.getBoundingClientRect().left;
      const last = track.querySelector(".chapter:last-of-type")?.getBoundingClientRect();
      const end = last ? Math.min(max, Math.max(0, last.left - base + last.width / 2 - vw / 2)) : max;
      stops.set([end, max]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [stops]);

  // Header contrast follows the scene, not the section box
  useMotionValueEvent(p, "change", (v) => {
    const el = stageRef.current;
    if (el) el.dataset.header = v > at(62) && v < fin(0.9) ? "dark" : "light";
  });

  // 1 — the drop falls
  const dropY = useTransform(p, [0, at(38)], ["-34svh", "0svh"], { ease: (t) => t * t });
  const dropOpacity = useTransform(p, [at(35), at(41)], [1, 0]);
  const dropScaleY = useTransform(p, [at(28), at(36), at(41)], [1, 1.12, 0.5]);

  // 2 — impact floods the screen
  const flood = useTransform(p, [at(38), at(95)], [0, 75]);
  const floodClip = useMotionTemplate`circle(${flood}% at 50% 50%)`;
  const rippleScale = useTransform(p, [at(38), at(88)], [0.2, 5]);
  const rippleOpacity = useTransform(p, [at(38), at(47), at(88)], [0, 0.7, 0]);

  // 3 — the current: arrives on the last chapter at TRACK.to, then keeps its
  // speed through the fade instead of braking into a stop.
  const trackX = useTransform(() => {
    const t = Math.max(0, (p.get() - TRACK.from) / (TRACK.to - TRACK.from));
    return -stops.get()[0] * t;
  });
  const drift = useTransform(() => {
    const max = stops.get()[1];
    return `${6 - 12 * (max ? -trackX.get() / max : 0)}%`;
  });
  const trackOpacity = useTransform(p, [at(75), at(100), ...TRACK.out], [0, 1, 1, 0]);

  // Finale keeps its own clock (0.57 → 1) over the last stretch
  const finaleP = useTransform(p, FINALE.scroll, FINALE.clock);

  // Gauge
  const gauge = useTransform(p, [at(75), fin(0.86)], [0, 1]);
  const gaugeOpacity = useTransform(p, [at(75), at(100), fin(0.84), fin(0.87)], [0, 1, 1, 0]);
  const chapterIndex = useTransform<number, string>(p, (v) =>
    v < at(280) ? "01" : v < FINALE_FROM ? "02" : "03",
  );

  if (reduce) {
    return (
      <section ref={sectionRef} id="motion" data-header="dark" className="relative py-32" style={{ background: "var(--deep-ocean)" }}>
        <div className="container-x flex flex-col gap-24">
          {chapters.map((c) => (
            <ChapterFrame key={c.index} chapter={c} drift={staticDrift} />
          ))}
        </div>
      </section>
    );
  }

  return (
    // Negative bottom margin: the (ice-blue) product section slides over the
    // last stretch of the pinned stage once the halo has filled the screen.
    <section
      ref={sectionRef}
      id="motion"
      className="relative"
      style={{ height: `${SCROLL + 100}svh`, marginBottom: "-40svh" }}
    >
      <div
        ref={stageRef}
        data-header="light"
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-white"
      >
        {/* The drop */}
        <motion.div
          className="absolute left-1/2 top-1/2 -ml-[14px] -mt-[20px] w-[28px] h-[40px] z-[3]"
          style={{ y: dropY, opacity: dropOpacity, scaleY: dropScaleY, color: "var(--sapphire-blue)" }}
        >
          <BrandDrop className="w-full h-full" />
        </motion.div>

        {/* Impact ripple */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-[30vmin] h-[30vmin] -ml-[15vmin] -mt-[15vmin] rounded-full z-[3]"
          style={{ border: "1px solid var(--sapphire-blue)", scale: rippleScale, opacity: rippleOpacity }}
        />

        {/* Deep sapphire flood */}
        <motion.div
          className="absolute inset-0 z-[1]"
          style={{
            clipPath: floodClip,
            background: "radial-gradient(120% 90% at 50% 40%, var(--deep-ocean) 0%, var(--abyss) 100%)",
          }}
        />

        {/* The current */}
        <motion.div className="absolute inset-0 z-[2] flex items-center" style={{ opacity: trackOpacity }}>
          <motion.div
            ref={trackRef}
            className="flex shrink-0 items-center gap-[12vw] md:gap-[9vw] pl-[var(--section-pad-x)] pr-[14vw] w-max"
            style={{ x: trackX }}
          >
            <div className="shrink-0 w-[82vw] md:w-[38vw]">
              <span className="eyebrow eyebrow--light">
                <i>03</i> Trải nghiệm
              </span>
              <h2
                className="display mt-6"
                style={{ fontSize: "var(--text-6xl)", color: "var(--pure-white)" }}
              >
                Nước,
                <br />
                <b>trong chuyển</b>
                <br />
                <b>động.</b>
              </h2>
              <p
                className="mt-8 max-w-[22rem]"
                style={{ fontSize: "var(--text-base)", fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}
              >
                Ba khoảnh khắc, một dòng chảy — hành trình của nước từ thiên nhiên đến tay bạn.
              </p>
            </div>
            {chapters.map((c) => (
              <ChapterFrame key={c.index} chapter={c} drift={drift} />
            ))}
          </motion.div>
        </motion.div>

        <Finale p={finaleP} />

        {/* Depth gauge */}
        <motion.div
          className="absolute inset-x-0 bottom-[5svh] z-[7] pointer-events-none"
          style={{ opacity: gaugeOpacity }}
        >
          <div className="container-x flex items-center gap-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            <span style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", fontVariantNumeric: "tabular-nums" }}>
              <motion.span>{chapterIndex}</motion.span>
              <span style={{ opacity: 0.4 }}> / 03</span>
            </span>
            <span className="relative flex-1 h-px" style={{ background: "rgba(255,255,255,0.14)" }}>
              <motion.span
                className="absolute inset-0 origin-left"
                style={{ scaleX: gauge, background: "var(--sapphire-light)" }}
              />
            </span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .chapter-frame { border-radius: 4px; }
        .finale-float { animation: finale-float 6s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
        @keyframes finale-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2%); }
        }
        @media (prefers-reduced-motion: reduce) { .finale-float { animation: none; } }
        .finale-copy { font-size: clamp(1.75rem, 5vw, 2.6rem); }
        @media (min-width: 1280px) {
          /* The copy column ends 2.5rem short of the halo's left edge, and the
             title scales to that column — it can never run under the disc. */
          .finale-copy-col {
            container-type: inline-size;
            width: calc(50vw - min(30svh, 40vw) - var(--section-pad-x) - 2.5rem);
          }
          .finale-copy { font-size: min(3.25rem, 12.4cqi); }
        }
        .chapter-frame--wide { width: 80vw; height: 46svh; }
        .chapter-frame--tall { width: 64vw; height: 52svh; }
        @media (min-width: 768px) {
          .chapter-frame--wide { width: 50vw; height: 62svh; }
          .chapter-frame--tall { width: 30vw; height: 70svh; }
        }
      `}</style>
    </section>
  );
}
