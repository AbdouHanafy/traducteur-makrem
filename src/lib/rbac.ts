import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { adminNeedsTwoFactorSetup } from "@/lib/admin-security";
import { findOrderById } from "@/repositories/orders";

/**
 * Vérification systématique "order.userId === session.user.id" avant toute lecture/écriture
 * (ARCHITECTURE.md §7) — sauf pour un ADMIN qui agit sur n'importe quelle
 * commande via les routes /api/admin/**.
 */
export async function requireOrderOwner(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "unauthenticated" as const };

  const order = await findOrderById(orderId);
  if (!order) return { error: "not_found" as const };

  if (order.userId !== session.user.id) return { error: "forbidden" as const };

  return { session, order };
}

/** Le back-office n'a qu'un seul rôle privilégié : "staff" et "admin" sont synonymes. */
export function requireStaffSession() {
  return requireAdminSession();
}

/**
 * Contenu métier (prix, FAQ, médiathèque) — décisions du cabinet, pas du travail de
 * traduction : réservé au rôle ADMIN, qui assure également le travail de traduction.
 */
export async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "unauthenticated" as const };

  if (session.user.role !== "ADMIN") return { error: "forbidden" as const };
  // Un administrateur sans double authentification n'a accès à aucune API du back-office.
  if (adminNeedsTwoFactorSetup(session.user)) return { error: "two_factor_required" as const };

  return { session };
}
