/**
 * Shared motion language for Sapphire Water.
 * One easing family across the site keeps every transition feeling like
 * the same body of water: quick to leave, slow to settle.
 */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];
export const EASE_SURFACE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Gentle inertia applied to scroll progress in pinned scenes. */
export const SCROLL_SPRING = { stiffness: 140, damping: 32, mass: 0.6, restDelta: 0.0005 };

/** Polygon whose top edge is a travelling sine wave — the waterline. */
export function waterline(level: number, phase: number, amp: number) {
  const n = 32;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    const y = level + amp * Math.sin((x / 100) * Math.PI * 3 + phase);
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")}, 100% 100%, 0% 100%)`;
}

/** 500ml bottle mockup (trimmed from Mock500ml.png) intrinsic size. */
export const BOTTLE = { src: "/images/product-500ml.png", width: 426, height: 1488 };

/** 20L jug mockup (trimmed from Mockup20L.png) intrinsic size. */
export const JUG = { src: "/images/product-20l.png", width: 693, height: 1234 };
