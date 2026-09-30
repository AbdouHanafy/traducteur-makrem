import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { isLocale, translate } from "@/lib/i18n";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { listActiveServices } from "@/repositories/services";
import { listVisibleHomeSections } from "@/repositories/homeSections";
import { listActiveTestimonials } from "@/repositories/testimonials";
import { listActivePartners } from "@/repositories/partners";
import HomePage from "@/views/HomePage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = isLocale(locale) ? locale : "fr";
  return buildMetadata({
    title: translate(lang, "brand.latin"),
    description: translate(lang, "seo.home.description"),
    path: "/",
  });
}

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [services, sections, testimonials, partners] = await Promise.all([
    listActiveServices(),
    listVisibleHomeSections(),
    listActiveTestimonials(),
    listActivePartners(),
  ]);

  return (
    <HomePage
      sections={sections.map((raw) => localize(raw, locale, TRANSLATABLE_FIELDS.homeSection)).map((s) => ({
        id: s.id,
        type: s.type,
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        imageUrl: s.imageUrl,
        ctaLabel: s.ctaLabel,
        ctaHref: s.ctaHref,
      }))}
      services={services.map((raw) => localize(raw, locale, TRANSLATABLE_FIELDS.service)).map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        pricePerPage: s.pricePerPage.toString(),
      }))}
      testimonials={testimonials.map((raw) => localize(raw, locale, TRANSLATABLE_FIELDS.testimonial)).map((t) => ({
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
