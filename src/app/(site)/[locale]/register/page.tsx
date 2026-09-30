import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import RegisterPage from "@/views/RegisterPage";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(isLocale(locale) ? locale : "fr", "register", "/register", true);
}

export default function Page() {
  return <RegisterPage />;
}
