/** The drop from the Sapphire mark (icon.svg), isolated. */
export const DROP_VIEWBOX = "172 240 70 98";
export const DROP_PATH =
  "M207.06,244.15c1.82,2.84,3,4.56,4.06,6.34,7.4,12.47,15.03,24.82,22.11,37.48,8.67,15.51,4.09,32.44-10.58,40.85-14.48,8.31-33.72,3.81-42.05-10.04-5.06-8.41-6.42-17.45-1.51-26.27,8.85-15.9,18.2-31.53,27.97-48.36Z";

export default function BrandDrop({ className }: { className?: string }) {
  return (
    <svg viewBox={DROP_VIEWBOX} className={className} aria-hidden>
      <path fill="currentColor" d={DROP_PATH} />
    </svg>
  );
}
