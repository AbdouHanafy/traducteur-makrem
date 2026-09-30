import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { readTranslationsMap } from "@/lib/localize";
import { listAllHomeSections, SYSTEM_SECTION_LABELS } from "@/repositories/homeSections";
import AdminHomeSectionsPage from "@/views/AdminHomeSectionsPage";

export const metadata = buildMetadata({ title: "Sections de la home (admin)", path: "/admin/home-sections", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const sections = await listAllHomeSections();

  return (
    <AdminHomeSectionsPage
      sections={sections.map((s) => ({
        id: s.id,
        type: s.type,
        label: SYSTEM_SECTION_LABELS[s.type],
        visible: s.visible,
        isCustom: s.type === "CUSTOM",
        eyebrow: s.eyebrow ?? "",
        title: s.title ?? "",
        body: s.body ?? "",
        imageUrl: s.imageUrl ?? "",
        ctaLabel: s.ctaLabel ?? "",
        ctaHref: s.ctaHref ?? "",
        translations: readTranslationsMap(s.translations),
      }))}
    />
  );
}
