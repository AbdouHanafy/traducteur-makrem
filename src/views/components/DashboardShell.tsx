"use client";

import WorkspaceShell, { type WorkspaceNavGroup } from "@/views/components/WorkspaceShell";
import { useI18n } from "@/views/components/I18nProvider";

export default function DashboardShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const { t } = useI18n();
  const groups: WorkspaceNavGroup[] = [
    { items: [{ href: "/dashboard", label: t("app.nav.dashboard"), icon: "home" }] },
    {
      label: t("app.nav.groupTranslations"),
      items: [
        { href: "/dashboard/orders", label: t("app.nav.orders"), icon: "orders" },
        { href: "/dashboard/fichiers", label: t("app.nav.documents"), icon: "files" },
      ],
    },
    {
      label: t("app.nav.groupHelp"),
      items: [
        { href: "/dashboard/support", label: t("app.nav.support"), icon: "support" },
        { href: "/dashboard/compte", label: t("app.nav.account"), icon: "account" },
      ],
    },
  ];

  return (
    <WorkspaceShell mode="client" user={user} groups={groups} primaryAction={{ href: "/commander", label: t("app.nav.newOrder") }}>
      {children}
    </WorkspaceShell>
  );
}
