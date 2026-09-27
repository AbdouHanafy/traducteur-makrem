import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/views/components/AdminShell";

/**
 * Vérification staff commune à tout /admin/** (ADMIN ou TRANSLATOR). Les pages qui exigent
 * ADMIN seul (services/FAQ/médiathèque) font leur propre vérification en plus — voir
 * lib/rbac.ts#requireAdminSession côté API, et le même contrôle côté page pour la redirection.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/admin/orders");
  if (session.user.role !== "ADMIN" && session.user.role !== "TRANSLATOR") redirect("/dashboard");

  return <AdminShell role={session.user.role}>{children}</AdminShell>;
}
