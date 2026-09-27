import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * `/dashboard` n'est plus qu'un aiguillage : l'espace client réel vit sous
 * /dashboard/orders (Phase 4+), l'espace staff sous /admin/orders.
 */
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  if (session.user.role === "ADMIN" || session.user.role === "TRANSLATOR") {
    redirect("/admin/orders");
  }

  redirect("/dashboard/orders");
}
