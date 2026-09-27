"use client";

import WorkspaceShell, { type WorkspaceNavGroup } from "@/views/components/WorkspaceShell";

const GROUPS: WorkspaceNavGroup[] = [
  { items: [{ href: "/admin", label: "Vue d'ensemble", icon: "home" }] },
  {
    label: "Opérations",
    items: [
      { href: "/admin/orders", label: "Commandes", icon: "orders" },
      { href: "/admin/users", label: "Clients & accès", icon: "users" },
    ],
  },
  {
    label: "Contenu du site",
    items: [
      { href: "/admin/home-sections", label: "Page d'accueil", icon: "page" },
      { href: "/admin/services", label: "Services & tarifs", icon: "services" },
      { href: "/admin/articles", label: "Articles", icon: "articles" },
      { href: "/admin/testimonials", label: "Avis clients", icon: "reviews" },
      { href: "/admin/faq", label: "FAQ", icon: "faq" },
      { href: "/admin/media", label: "Médiathèque", icon: "media" },
    ],
  },
  {
    label: "Compte",
    items: [{ href: "/admin/account", label: "Mon compte", icon: "account" }],
  },
];

export default function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  return <WorkspaceShell mode="admin" user={user} groups={GROUPS}>{children}</WorkspaceShell>;
}
