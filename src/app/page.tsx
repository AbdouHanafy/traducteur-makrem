import { buildMetadata, SITE } from "@/lib/seo";
import { listActiveServices } from "@/repositories/services";
import { listVisibleHomeSections } from "@/repositories/homeSections";
import { listActiveTestimonials } from "@/repositories/testimonials";
import { listActivePartners } from "@/repositories/partners";
import HomePage from "@/views/HomePage";

export const metadata = buildMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
});

export default async function Page() {
  const [services, sections, testimonials, partners] = await Promise.all([
    listActiveServices(),
    listVisibleHomeSections(),
    listActiveTestimonials(),
    listActivePartners(),
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
      services={services.map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        pricePerPage: s.pricePerPage.toString(),
      }))}
      testimonials={testimonials.map((t) => ({
        id: t.id,
        authorName: t.authorName,
        authorRole: t.authorRole,
        quote: t.quote,
        rating: t.rating,
      }))}
      partners={partners.map((partner) => ({ id: partner.id, name: partner.name, logoUrl: partner.logoUrl, websiteUrl: partner.websiteUrl }))}
    />
  );
}
