import { buildMetadata, SITE } from "@/lib/seo";
import { listActiveServices } from "@/repositories/services";
import { listVisibleHomeSections } from "@/repositories/homeSections";
import { listActiveTestimonials } from "@/repositories/testimonials";
import HomePage from "@/views/HomePage";

export const metadata = buildMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
});

export default async function Page() {
  const [services, sections, testimonials] = await Promise.all([
    listActiveServices(),
    listVisibleHomeSections(),
    listActiveTestimonials(),
  ]);

  return (
    <HomePage
      sections={sections.map((s) => ({
        id: s.id,
        type: s.type,
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        imageUrl: s.imageUrl,
        ctaLabel: s.ctaLabel,
        ctaHref: s.ctaHref,
      }))}
      services={services.map((s) => ({ slug: s.slug, name: s.name, description: s.description }))}
      testimonials={testimonials.map((t) => ({
        id: t.id,
        authorName: t.authorName,
        authorRole: t.authorRole,
        quote: t.quote,
        rating: t.rating,
      }))}
    />
  );
}
