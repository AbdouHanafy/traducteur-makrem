import type { Metadata } from "next";
import { isLocale, translate } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { breadcrumbJsonLd } from "@/lib/seo";
import { notFound } from "next/navigation";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { listActiveFaqs } from "@/repositories/faq";
import FaqPage from "@/views/FaqPage";
import JsonLd from "@/views/components/JsonLd";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "faq", "/faq");
}

export default async function Page({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const faqs = (await listActiveFaqs()).map((faq) => localize(faq, locale, TRANSLATABLE_FIELDS.faq));

  const entries = faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }));
  const faqJsonLd = {
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbJsonLd(locale, [
            { name: translate(locale, "nav.home"), path: "/" },
            { name: translate(locale, "seo.faq.title"), path: "/faq" },
          ]),
        ]}
      />
      <FaqPage faqs={entries} />
    </>
  );
}
