"use client";

import WorkspaceShell, { type WorkspaceNavGroup } from "@/views/components/WorkspaceShell";

const GROUPS: WorkspaceNavGroup[] = [
  { items: [{ href: "/dashboard", label: "Tableau de bord", icon: "home" }] },
  {
    label: "Mes traductions",
    items: [
      { href: "/dashboard/orders", label: "Mes commandes", icon: "orders" },
      { href: "/dashboard/fichiers", label: "Mes documents", icon: "files" },
    ],
  },
  {
    label: "Aide & compte",
    items: [
      { href: "/dashboard/support", label: "Aide & contact", icon: "support" },
      { href: "/dashboard/compte", label: "Mon compte", icon: "account" },
    ],
  },
];

export default function DashboardShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  return (
    <WorkspaceShell mode="client" user={user} groups={GROUPS} primaryAction={{ href: "/commander", label: "Nouvelle commande" }}>
      {children}
    </WorkspaceShell>
  );
}
