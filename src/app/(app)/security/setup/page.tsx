import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminNeedsTwoFactorSetup } from "@/lib/admin-security";
import { buildMetadata } from "@/lib/seo";
import TwoFactorSetupPage from "@/views/TwoFactorSetupPage";

export const metadata = buildMetadata({ title: "Sécuriser le compte", path: "/security/setup", noIndex: true });

/** Étape obligatoire pour un administrateur sans double authentification (hors du layout /admin pour éviter une boucle de redirection). */
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/security/setup");
  const { next } = await searchParams;
  const destination = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/dashboard";
  if (!adminNeedsTwoFactorSetup(session.user) && session.user.twoFactorEnabled === true) redirect(destination);

  return <TwoFactorSetupPage destination={destination} mandatory={session.user.role === "ADMIN"} />;
}
