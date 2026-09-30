"use client";

import WorkspaceShell, { type WorkspaceNavGroup } from "@/views/components/WorkspaceShell";
import { useI18n } from "@/views/components/I18nProvider";

export default function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const { t } = useI18n();
  const groups: WorkspaceNavGroup[] = [
    { items: [{ href: "/admin", label: t("adm.nav.overview"), icon: "home" }] },
    {
      label: t("adm.nav.groupOps"),
      items: [
        { href: "/admin/orders", label: t("adm.nav.orders"), icon: "orders" },
        { href: "/admin/users", label: t("adm.nav.users"), icon: "users" },
      ],
    },
    {
      label: t("adm.nav.groupContent"),
      items: [
        { href: "/admin/site-content", label: t("adm.nav.siteContent"), icon: "page" },
        { href: "/admin/home-sections", label: t("adm.nav.home"), icon: "page" },
        { href: "/admin/theme", label: t("adm.nav.theme"), icon: "media" },
        { href: "/admin/partners", label: t("adm.nav.partners"), icon: "reviews" },
        { href: "/admin/services", label: t("adm.nav.services"), icon: "services" },
        { href: "/admin/articles", label: t("adm.nav.articles"), icon: "articles" },
        { href: "/admin/testimonials", label: t("adm.nav.testimonials"), icon: "reviews" },
        { href: "/admin/faq", label: t("adm.nav.faq"), icon: "faq" },
        { href: "/admin/media", label: t("adm.nav.media"), icon: "media" },
      ],
    },
    {
      label: t("adm.nav.groupAccount"),
      items: [{ href: "/admin/account", label: t("adm.nav.account"), icon: "account" }],
    },
  ];
  return <WorkspaceShell mode="admin" user={user} groups={groups}>{children}</WorkspaceShell>;
}
