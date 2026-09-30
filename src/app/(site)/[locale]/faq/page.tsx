import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { notFound } from "next/navigation";
import { localize, TRANSLATABLE_FIELDS } from "@/lib/localize";
import { listActiveFaqs } from "@/repositories/faq";
import FaqPage from "@/views/FaqPage";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "faq", "/faq");
}

export default async function Page({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const faqs = (await listActiveFaqs()).map((faq) => localize(faq, locale, TRANSLATABLE_FIELDS.faq));

  return <FaqPage faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />;
}
