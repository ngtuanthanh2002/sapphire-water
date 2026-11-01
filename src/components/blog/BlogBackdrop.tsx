import Image from "next/image";

/** Water seen through deep sapphire, fixed behind every blog page. */
export default function BlogBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10" style={{ backgroundColor: "var(--sapphire-dark)" }}>
      <Image
        src="/images/hero-water-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        style={{ mixBlendMode: "multiply" }}
      />
    </div>
  );
}
