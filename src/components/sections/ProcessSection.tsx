"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { waterline } from "@/lib/motion";
import { RevealLines } from "@/components/ui/Reveal";
import { NIGHT } from "@/components/sections/PuritySection";

const steps = [
  {
    index: "01",
    kicker: "Chai 500ml",
    title: "Kiểm tra ngay trên chuyền",
    body: "Đội ngũ vận hành theo sát dây chuyền chiết rót, kiểm tra sản phẩm ngay khi chai còn trên băng chuyền.",
    image: "/images/line-500ml-inspection.png",
    alt: "Nhân viên kiểm tra chai Sapphire Water 500ml trên dây chuyền chiết rót",
    position: "18% 50%",
  },
  {
    index: "02",
    kicker: "Bình 20L",
    title: "Bình lớn, cùng một chuẩn mực",
    body: "Bình cho gia đình và văn phòng đi qua cùng một tiêu chuẩn kiểm soát như chai nhỏ trên tay bạn.",
    image: "/images/line-20l-bottling.png",
    alt: "Nhân viên đặt bình Sapphire Water 20L lên băng chuyền",
    position: "50% 15%",
  },
] as const;

function Heading() {
  return (
    <>
      <span className="eyebrow eyebrow--light">
        <i>07</i> Quy trình
      </span>
      <h2
        className="display mt-6 whitespace-nowrap"
        style={{ fontSize: "clamp(2.25rem, 4.2vw, 4rem)", color: "var(--pure-white)" }}
      >
        <RevealLines lines={["Từ dây chuyền", <b key="b">đến tay bạn</b>]} />
      </h2>
    </>
  );
}

function StepCopy({ step }: { step: (typeof steps)[number] }) {
  return (
    <>
      <p
        className="uppercase"
        style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--sapphire-light)", fontWeight: 500 }}
      >
        {step.kicker}
      </p>
      <h3
        className="mt-3"
        style={{ fontSize: "var(--text-xl)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--pure-white)" }}
      >
        {step.title}
      </h3>
      <p
        className="mt-3 max-w-[26rem]"
        style={{ fontSize: "var(--text-sm)", lineHeight: 1.8, fontWeight: 300, color: "rgba(255,255,255,0.62)" }}
      >
        {step.body}
      </p>
    </>
  );
}

function Step({ step, opacity, y }: { step: (typeof steps)[number]; opacity: MotionValue<number>; y: MotionValue<number> }) {
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity, y }}>
      <StepCopy step={step} />
    </motion.div>
  );
}

/**
 * Motion moment — "Dây chuyền".
 * The 500ml line holds the frame; then the 20L line rises over it behind a
 * living waterline, the way a jug fills. Tied to scroll with no spring.
 */
export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress: entry } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const insetY = useTransform(entry, [0.25, 1], [10, 0]);
  const insetL = useTransform(entry, [0.25, 1], [14, 0]);
  const radius = useTransform(entry, [0.25, 1], [6, 0]);
  const plateClip = useMotionTemplate`inset(${insetY}% 0% ${insetY}% ${insetL}% round ${radius}px 0 0 ${radius}px)`;

  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const fill = useTransform(p, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.26) / 0.48));
    return waterline(107 - t * 114, t * Math.PI * 4, 2.8 * Math.sin(Math.PI * t));
  });
  const firstScale = useTransform(p, [0, 0.74], [1.08, 1]);
  const secondScale = useTransform(p, [0.26, 1], [1.14, 1]);

  const firstOpacity = useTransform(p, [0.41, 0.5], [1, 0]);
  const firstY = useTransform(p, [0.41, 0.5], [0, -18]);
  const secondOpacity = useTransform(p, [0.5, 0.59], [0, 1]);
  const secondY = useTransform(p, [0.5, 0.59], [18, 0]);

  const gauge = useTransform(p, [0, 0.8], [0, 1]);
  const stepIndex = useTransform<number, string>(p, (v) => (v < 0.5 ? "01" : "02"));

  if (reduce) {
    return (
      <section
        ref={sectionRef}
        id="process"
        data-header="dark"
        className="relative"
        style={{ backgroundColor: NIGHT, paddingBlock: "var(--section-pad-y)" }}
      >
        <div className="container-x">
          <Heading />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10">
            {steps.map((step) => (
              <div key={step.index}>
                <div className="relative overflow-hidden mb-6" style={{ aspectRatio: "4 / 3", borderRadius: 4 }}>
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: step.position }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <StepCopy step={step} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="process"
      data-header="dark"
      className="relative"
      style={{ height: "300svh", backgroundColor: NIGHT }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden flex flex-col-reverse lg:flex-row">
        <div className="shrink-0 lg:w-[40%] flex flex-col justify-center px-[var(--section-pad-x)] pt-7 pb-10 lg:py-0">
          <Heading />

          <div className="grid mt-6 lg:mt-12">
            <Step step={steps[0]} opacity={firstOpacity} y={firstY} />
            <Step step={steps[1]} opacity={secondOpacity} y={secondY} />
          </div>

          <div className="mt-6 lg:mt-12 flex items-center gap-5" style={{ color: "rgba(255,255,255,0.7)" }}>
            <span style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", fontVariantNumeric: "tabular-nums" }}>
              <motion.span>{stepIndex}</motion.span>
              <span style={{ opacity: 0.4 }}> / 02</span>
            </span>
            <span className="relative flex-1 h-px" style={{ background: "rgba(255,255,255,0.14)" }}>
              <motion.span
                className="absolute inset-0 origin-left"
                style={{ scaleX: gauge, background: "var(--sapphire-light)" }}
              />
            </span>
          </div>
        </div>

        <motion.div className="relative flex-1 min-h-0 overflow-hidden" style={{ clipPath: plateClip }}>
          <motion.div className="absolute inset-0" style={{ scale: firstScale }}>
            <Image
              src={steps[0].image}
              alt={steps[0].alt}
              fill
              className="object-cover select-none"
              style={{ objectPosition: steps[0].position }}
              sizes="(max-width: 1024px) 100vw, 60vw"
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath: fill }}>
            <motion.div className="absolute inset-0" style={{ scale: secondScale }}>
              <Image
                src={steps[1].image}
                alt={steps[1].alt}
                fill
                className="object-cover select-none"
                style={{ objectPosition: steps[1].position }}
                sizes="(max-width: 1024px) 100vw, 60vw"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
