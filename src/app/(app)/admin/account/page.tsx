import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { isAdminTwoFactorRequired } from "@/lib/admin-security";
import AccountPage from "@/views/AccountPage";

export const metadata = buildMetadata({ title: "Mon compte (admin)", path: "/admin/account", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/login?callbackUrl=/admin/account");

  return <AccountPage email={session.user.email} name={session.user.name} twoFactorMandatory={isAdminTwoFactorRequired()} />;
}
