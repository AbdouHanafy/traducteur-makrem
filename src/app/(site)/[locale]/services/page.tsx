import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { notFound } from "next/navigation";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { listActiveServices } from "@/repositories/services";
import ServicesPage from "@/views/ServicesPage";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "services", "/services");
}

export default async function Page({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const services = (await listActiveServices()).map((service) => localize(service, locale, TRANSLATABLE_FIELDS.service));

  return (
    <ServicesPage
      services={services.map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        pricePerPage: s.pricePerPage.toString(),
      }))}
    />
  );
}
