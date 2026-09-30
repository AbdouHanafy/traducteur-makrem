import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { listActiveServices } from "@/repositories/services";
import { listActivePricingRules } from "@/repositories/pricingRules";
import OrderWizardPage from "@/views/OrderWizardPage";


/** Statique par langue : le service pré-sélectionné (?service=) est lu côté client. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "order", "/commander", true);
}

export default async function Page({ params }: PageProps<"/[locale]/commander">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [services, rules] = await Promise.all([listActiveServices(), listActivePricingRules()]);
  const delayMultipliers = Object.fromEntries(rules.map((rule) => [rule.key, (rule.multiplier ?? 1).toString()]));
  const orderable = services
    .filter((s) => !s.pricePerPage.isZero())
    .map((s) => localize(s, locale, TRANSLATABLE_FIELDS.service))
    .map((s) => ({ id: s.id, slug: s.slug, name: s.name, pricePerPage: s.pricePerPage.toString() }));

  return (
    <Suspense>
      <OrderWizardPage services={orderable} delayMultipliers={delayMultipliers} />
    </Suspense>
  );
}
