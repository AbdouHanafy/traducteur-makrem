import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { LEGAL_PATHS } from "@/lib/i18n-legal";
import { pageMetadata } from "@/lib/page-metadata";
import LegalPage from "@/views/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "notice", LEGAL_PATHS.notice);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage page="notice" />;
}
