import Image from "next/image";

const SIZE_CLASSES = {
  sm: "h-8 w-[52px]",
  md: "h-10 w-[65px]",
  lg: "h-12 w-[78px]",
} as const;

export default function BrandLogo({
  size = "md",
  onDark = false,
  priority = false,
}: {
  size?: keyof typeof SIZE_CLASSES;
  onDark?: boolean;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${SIZE_CLASSES[size]} ${
        onDark ? "rounded-xl bg-white px-1.5 py-1 shadow-[0_6px_18px_rgba(0,0,0,0.18)]" : ""
      }`}
    >
      <Image
        src="/brand/makram-arfaoui-logo.png"
        alt=""
        width={1664}
        height={1024}
        priority={priority}
        sizes={size === "lg" ? "78px" : size === "md" ? "65px" : "52px"}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
