import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminNeedsTwoFactorSetup } from "@/lib/admin-security";
import AdminShell from "@/views/components/AdminShell";

/** Vérification ADMIN commune à tout le back-office. L'admin est aussi le traducteur. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  if (adminNeedsTwoFactorSetup(session.user)) redirect("/security/setup?next=/admin");

  return <AdminShell user={{ name: session.user.name, email: session.user.email }}>{children}</AdminShell>;
}
