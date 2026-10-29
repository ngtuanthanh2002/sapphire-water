"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { EASE_OUT, EASE_SURFACE } from "@/lib/motion";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** A line that rises out of its own mask, driven by scroll progress `p`. */
export function ScrollLine({
  p,
  at,
  span = 0.045,
  children,
  className,
  style,
}: {
  p: MotionValue<number>;
  at: number;
  span?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  // 135%, not 110%: Vietnamese stacked diacritics sit above the line box and
  // would otherwise peek out of the mask before the line rises.
  const y = useTransform(p, [at, at + span], ["135%", "0%"], { ease: easeOutCubic });
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <motion.span className={`block ${className ?? ""}`} style={{ ...style, y }}>
        {children}
      </motion.span>
    </span>
  );
}

/** Lines rise out of a hairline mask, one after another. */
export function RevealLines({
  lines,
  delay = 0,
  stagger = 0.09,
  className,
  lineClassName,
}: {
  lines: ReactNode[];
  delay?: number;
  stagger?: number;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            variants={{
              // 135%: Vietnamese stacked diacritics rise above the line box
              hidden: { y: "135%" },
              show: { y: "0%", transition: { duration: 1.2, delay: delay + i * stagger, ease: EASE_SURFACE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Soft fade + lift for supporting copy. */
export function FadeUp({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p" | "span";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE_OUT }}
    >
      {children}
    </Tag>
  );
}
