"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { BOTTLE, EASE_SURFACE, JUG } from "@/lib/motion";
import { FadeUp, RevealLines } from "@/components/ui/Reveal";

/**
 * Closing frame — bookends the hero. The water surface returns as a framed
 * panel; the 20L jug breaks out of its top edge with the 500ml in front.
 */
export default function FinalSection() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const jugY = useTransform(scrollYProgress, [0, 0.55], ["14%", "0%"]);
  const bottleY = useTransform(scrollYProgress, [0, 0.55], ["26%", "0%"]);

  return (
    <section className="relative bg-white" style={{ paddingBlock: "var(--section-pad-y)" }}>
      <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-8 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <FadeUp>
            <Image
              src="/images/logo.svg"
              alt="Sapphire Water"
              width={500}
              height={138}
              className="h-[46px] w-auto"
            />
          </FadeUp>

          <h2 className="display mt-12 whitespace-nowrap" style={{ fontSize: "clamp(2.5rem, 4.8vw, 4.75rem)", color: "var(--ink)" }}>
            <RevealLines lines={["Pure Life –", <b key="b">Pure Water.</b>]} />
          </h2>

          <FadeUp as="p" className="lede mt-8 max-w-[26rem]" delay={0.2}>
            Sapphire Water — thương hiệu nước uống tinh khiết mang đến trải nghiệm thuần khiết hoàn
            hảo, được chọn lọc và tinh lọc với tiêu chuẩn cao nhất.
          </FadeUp>

          <FadeUp delay={0.3} className="mt-12 flex items-center gap-5">
            <span className="eyebrow" style={{ color: "var(--ink-50)" }}>
              Nước tinh khiết cao cấp
            </span>
          </FadeUp>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
          <div ref={panelRef} className="relative mt-[12svh] lg:mt-[16svh]" style={{ aspectRatio: "4 / 4.6" }}>
            <motion.div
              className="absolute inset-0 overflow-hidden"
              style={{ borderRadius: 4 }}
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1.6, ease: EASE_SURFACE }}
            >
              <motion.div className="absolute -inset-y-[10%] inset-x-0" style={{ y: imgY }}>
                <Image
                  src="/images/hero-water-bg.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </motion.div>

            {/* 20L jug — behind, breaking the frame's top edge */}
            <motion.div
              className="absolute left-[42%] -translate-x-1/2 bottom-[8%] h-[104%]"
              style={{ y: jugY }}
            >
              <Image
                src={JUG.src}
                alt="Bình nước Sapphire Water 20L"
                width={JUG.width}
                height={JUG.height}
                sizes="(max-width: 1024px) 60vw, 440px"
                className="h-full w-auto select-none"
                draggable={false}
              />
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -bottom-[0.5%] w-[100%] h-[2.6%] rounded-[50%]"
                style={{ background: "rgba(6,43,82,0.25)", filter: "blur(12px)" }}
              />
            </motion.div>

            {/* 500ml bottle — foreground */}
            <motion.div
              className="absolute left-[77%] -translate-x-1/2 bottom-[3%] h-[70%]"
              style={{ y: bottleY }}
            >
              <Image
                src={BOTTLE.src}
                alt="Chai nước Sapphire Water 500ml"
                width={BOTTLE.width}
                height={BOTTLE.height}
                sizes="(max-width: 1024px) 25vw, 170px"
                className="h-full w-auto select-none"
                draggable={false}
              />
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 -bottom-[0.5%] w-[115%] h-[2.6%] rounded-[50%]"
                style={{ background: "rgba(6,43,82,0.28)", filter: "blur(8px)" }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
