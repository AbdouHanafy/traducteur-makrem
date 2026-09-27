const SIZE_CLASSES = {
  compact: {
    latin: "text-[10.5px] tracking-[0.1em]",
    arabic: "text-[14px]",
  },
  default: {
    latin: "text-[12px] tracking-[0.11em]",
    arabic: "text-[16px]",
  },
  large: {
    latin: "text-[17px] tracking-[0.1em]",
    arabic: "text-[23px]",
  },
} as const;

export default function BrandName({
  size = "default",
  onDark = false,
}: {
  size?: keyof typeof SIZE_CLASSES;
  onDark?: boolean;
}) {
  const styles = SIZE_CLASSES[size];

  return (
    <span className="min-w-0 leading-none">
      <span
        className={`block whitespace-nowrap font-sans font-semibold uppercase leading-tight ${styles.latin} ${
          onDark ? "text-white" : "text-navy"
        }`}
      >
        Maître Makram Arfaoui
      </span>
      <span
        lang="ar"
        dir="rtl"
        className={`brand-name-ar mt-0.5 block whitespace-nowrap font-semibold leading-tight ${styles.arabic} ${
          onDark ? "text-[#c7d6f1]" : "text-navy"
        }`}
      >
        الأستاذ مكرم العرفاوي
      </span>
    </span>
  );
}
