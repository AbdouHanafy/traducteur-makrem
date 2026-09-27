import Link from "next/link";

export interface CustomSectionData {
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
}

/**
 * Seul type de section entièrement piloté par le backoffice (/admin/home-sections) — voir
 * HomeSection dans schema.prisma. Les autres sections de la home gardent leur mise en page
 * codée en dur (identité de marque), seul leur ordre/visibilité est piloté depuis là.
 */
export default function CustomSection({ data }: { data: CustomSectionData }) {
  const hasImage = Boolean(data.imageUrl);

  return (
    <section className="py-20">
      <div
        className={`mx-auto max-w-[1160px] items-center gap-12 px-[22px] ${
          hasImage ? "grid md:grid-cols-[1fr_1fr]" : ""
        }`}
      >
        <div className={hasImage ? "" : "mx-auto max-w-[720px] text-center"}>
          {data.eyebrow && (
            <span className="mb-3 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue">
              <span className="h-0.5 w-5.5 rounded bg-blue" />
              {data.eyebrow}
            </span>
          )}
          {data.title && <h2 className="text-[clamp(26px,3.2vw,36px)] text-navy">{data.title}</h2>}
          {data.body && (
            <p className="mt-4 whitespace-pre-line text-[15.5px] leading-relaxed text-muted">{data.body}</p>
          )}
          {data.ctaLabel && data.ctaHref && (
            <Link
              href={data.ctaHref}
              className="mt-6 inline-flex items-center gap-2 rounded-[11px] bg-blue px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-blue-2"
            >
              {data.ctaLabel}
            </Link>
          )}
        </div>
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.imageUrl!} alt="" className="w-full rounded-[16px] object-cover" />
        )}
      </div>
    </section>
  );
}
