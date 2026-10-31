"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { BOTTLE, EASE_OUT, EASE_SURFACE, JUG } from "@/lib/motion";
import { FadeUp, RevealLines } from "@/components/ui/Reveal";

type Spec = { side: "left" | "right"; top: string; title: string; desc: string };

const products = [
  {
    id: "500ml",
    label: "500ml",
    sub: "Chai cá nhân",
    caption: "Đồng hành mỗi ngày — gọn trong tay, tinh khiết trong từng ngụm.",
    image: BOTTLE,
    alt: "Chai nước Sapphire Water 500ml",
    height: "100%",
    specs: [
      { side: "left", top: "18%", title: "Tinh khiết tuyệt đối", desc: "Quy trình lọc nhiều tầng loại bỏ hoàn toàn tạp chất, giữ lại vị nước tinh khiết nhất." },
      { side: "right", top: "40%", title: "Thiết kế cao cấp", desc: "Chai trong suốt với nhãn hiệu tinh tế, phản ánh phẩm chất bên trong." },
      { side: "left", top: "62%", title: "Nguồn nước chọn lọc", desc: "Từ nguồn nước được chọn lọc kỹ lưỡng, đảm bảo chất lượng ngay từ bước đầu tiên." },
      { side: "right", top: "80%", title: "Tiêu chuẩn quốc tế", desc: "Sản xuất theo quy trình đạt tiêu chuẩn nghiêm ngặt, đảm bảo an toàn tuyệt đối." },
    ] as Spec[],
  },
  {
    id: "20l",
    label: "20L",
    sub: "Bình gia đình",
    caption: "Nguồn nước tinh khiết cho gia đình và văn phòng — dùng trực tiếp hoặc với cây nóng lạnh.",
    image: JUG,
    alt: "Bình nước Sapphire Water 20L có vòi",
    height: "90%",
    specs: [
      { side: "left", top: "21%", title: "Công nghệ RO – UV – Ozone", desc: "Lọc thẩm thấu ngược RO cao cấp, khử khuẩn bằng UV và Ozone, kết hợp tạo khoáng." },
      { side: "right", top: "39%", title: "Khoáng chất bổ sung", desc: "Bổ sung Canxi (Ca²⁺) và Magie (Mg²⁺) — những khoáng chất thiết yếu." },
      { side: "left", top: "65%", title: "Đạt chuẩn chất lượng", desc: "Phù hợp QCVN 6-1:2010/BYT, quy trình sản xuất đạt ISO 22000:2018." },
      { side: "right", top: "82%", title: "Vòi rót tiện lợi", desc: "Rót trực tiếp từ vòi. Sau khi mở nắp, nên dùng hết trong vòng 7 ngày." },
    ] as Spec[],
  },
] as const;

type Product = (typeof products)[number];

function Callout({
  spec,
  index,
  productId,
  progress,
}: {
  spec: Spec;
  index: number;
  productId: string;
  progress: MotionValue<number>;
}) {
  const start = 0.12 + index * 0.13;
  const draw = useTransform(progress, [start, start + 0.2], [0, 1]);
  const opacity = useTransform(progress, [start + 0.08, start + 0.24], [0, 1]);
  const y = useTransform(progress, [start + 0.08, start + 0.24], [14, 0]);
  const left = spec.side === "left";

  return (
    <motion.div
      className={`absolute w-[39%] flex items-start gap-5 ${left ? "left-0 flex-row" : "right-0 flex-row-reverse text-right"}`}
      animate={{ top: spec.top }}
      initial={false}
      transition={{ duration: 0.9, ease: EASE_SURFACE }}
    >
      <motion.div style={{ opacity, y }} className="w-[15.5rem] shrink-0 -mt-[0.6em]">
        <motion.div
          key={productId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 + index * 0.06, ease: EASE_OUT }}
        >
          <span style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--sapphire-blue)", fontWeight: 500 }}>
            0{index + 1}
          </span>
          <h3 className="mt-2" style={{ fontSize: "var(--text-lg)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)" }}>
            {spec.title}
          </h3>
          <p className="mt-2" style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, fontWeight: 300, color: "var(--ink-70)" }}>
            {spec.desc}
          </p>
        </motion.div>
      </motion.div>
      <div className="relative flex-1 h-px">
        <motion.span
          className="absolute inset-0"
          style={{ scaleX: draw, background: "var(--sapphire-blue)", opacity: 0.45, transformOrigin: left ? "left" : "right" }}
        />
        <motion.span
          className={`absolute top-1/2 -mt-[3px] w-[6px] h-[6px] rounded-full ${left ? "-right-[3px]" : "-left-[3px]"}`}
          style={{ scale: draw, background: "var(--sapphire-blue)" }}
        />
      </div>
    </motion.div>
  );
}

function ProductSwitch({ active, onChange }: { active: Product["id"]; onChange: (id: Product["id"]) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Chọn sản phẩm"
      className="inline-flex p-1 rounded-full"
      style={{ background: "var(--pure-white)", boxShadow: "0 0 0 1px var(--ink-08)" }}
    >
      {products.map((p) => {
        const selected = p.id === active;
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={selected}
            aria-controls="product-plate"
            onClick={() => onChange(p.id)}
            className="relative px-6 py-3 rounded-full cursor-pointer text-left"
          >
            {selected && (
              <motion.span
                layoutId="product-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--deep-ocean)" }}
                transition={{ duration: 0.6, ease: EASE_SURFACE }}
              />
            )}
            <span className="relative block transition-colors duration-500" style={{ color: selected ? "var(--pure-white)" : "var(--ink)" }}>
              <span className="block" style={{ fontSize: "var(--text-lg)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {p.label}
              </span>
              <span
                className="block mt-1 uppercase"
                style={{ fontSize: "0.625rem", letterSpacing: "0.18em", opacity: selected ? 0.7 : 0.5 }}
              >
                {p.sub}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Motion moment 04 — "Giải phẫu".
 * Each product stands on a pure-white plinth against ice blue; spec leaders
 * draw themselves toward it as you descend, like an annotated product plate.
 * The switch swaps the 500ml bottle and the 20L jug on the same baseline.
 */
export default function ProductSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<Product["id"]>("500ml");
  const active = products.find((p) => p.id === activeId) ?? products[0];

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start 0.9", "end 0.6"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });
  const settled = useTransform(progress, () => 1);
  const drive = reduce ? settled : progress;

  const { scrollYProgress: pass } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const productY = useTransform(pass, [0, 1], ["4%", "-4%"]);
  const plinthScale = useTransform(progress, [0, 0.4], [0.82, 1]);

  return (
    <section
      id="product"
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--ice-blue)", paddingBlock: "clamp(2rem, 4vh, 3rem) var(--section-pad-y)" }}
    >
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 items-end">
          <div className="lg:col-span-7">
            <span className="eyebrow">
              <i>04</i> Dòng sản phẩm
            </span>
            <h2 className="display mt-6" style={{ fontSize: "var(--text-6xl)", color: "var(--ink)" }}>
              <RevealLines lines={["The Signature", <b key="b">Sapphire Water</b>]} />
            </h2>
          </div>
          <FadeUp className="lg:col-span-4 lg:col-start-9 flex flex-col items-start gap-6" delay={0.2}>
            <ProductSwitch active={activeId} onChange={setActiveId} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={active.id}
                className="lede max-w-[22rem]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {active.caption}
              </motion.p>
            </AnimatePresence>
          </FadeUp>
        </div>

        {/* Product plate */}
        <div ref={stageRef} id="product-plate" role="tabpanel" className="relative mt-[clamp(3rem,8vh,6rem)]">
          <div className="relative mx-auto h-[68svh] lg:h-[min(92svh,940px)]">
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
              style={{ width: "min(74svh, 82vw, 760px)", aspectRatio: "1", scale: reduce ? 1 : plinthScale }}
            />

            <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : productY }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.id}
                  className="absolute inset-0 flex items-end justify-center"
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                  transition={{ duration: 0.9, ease: EASE_SURFACE }}
                >
                  <div className="relative" style={{ height: active.height }}>
                    <Image
                      src={active.image.src}
                      alt={active.alt}
                      width={active.image.width}
                      height={active.image.height}
                      sizes={active.id === "20l" ? "(max-width: 768px) 75vw, 500px" : "(max-width: 768px) 40vw, 280px"}
                      className="h-full w-auto select-none"
                      draggable={false}
                    />
                    <div
                      aria-hidden
                      className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[104%] h-[2.4%] rounded-[50%]"
                      style={{ background: "rgba(6,43,82,0.2)", filter: "blur(12px)" }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Desktop callouts */}
            <div className="absolute inset-0 hidden lg:block pointer-events-none">
              {active.specs.map((spec, i) => (
                <Callout key={i} spec={spec} index={i} productId={active.id} progress={drive} />
              ))}
            </div>
          </div>

          {/* Mobile / tablet specs */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mt-14">
            {active.specs.map((spec, i) => (
              <motion.div
                key={active.id + i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: EASE_OUT }}
              >
                <div className="hairline mb-5" />
                <span style={{ fontSize: "var(--text-xs)", letterSpacing: "0.2em", color: "var(--sapphire-blue)", fontWeight: 500 }}>
                  0{i + 1}
                </span>
                <h3 className="mt-2" style={{ fontSize: "var(--text-lg)", fontWeight: 500, color: "var(--ink)" }}>
                  {spec.title}
                </h3>
                <p className="mt-2" style={{ fontSize: "var(--text-sm)", lineHeight: 1.7, fontWeight: 300, color: "var(--ink-70)" }}>
                  {spec.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The whole range, side by side */}
        <div className="mt-[clamp(5rem,14vh,9rem)] grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8 items-center">
          <div className="lg:col-span-4">
            <h3 className="display" style={{ fontSize: "var(--text-3xl)", color: "var(--ink)" }}>
              <RevealLines lines={["Một dòng nước,", <b key="b">đủ mọi nhu cầu</b>]} />
            </h3>
            <FadeUp as="p" className="lede mt-6 max-w-[24rem]" delay={0.2}>
              Từ chai 500ml nhỏ gọn trong tay đến bình 20L cho gia đình và văn phòng — cùng một
              nguồn nước, cùng một sự trong trẻo.
            </FadeUp>
          </div>
          <motion.div
            className="lg:col-span-8 relative overflow-hidden"
            style={{ aspectRatio: "1540 / 1021", borderRadius: 4 }}
            initial={reduce ? false : { clipPath: "inset(10% 10% 10% 10%)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.6, ease: EASE_SURFACE }}
          >
            <Image
              src="/images/range-presenter.png"
              alt="Nhân viên Sapphire Water giới thiệu chai 500ml, lốc chai và bình 20L"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
