import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import AccountPage from "@/views/AccountPage";

export const metadata = buildMetadata({ title: "Mon compte", path: "/dashboard/compte", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/dashboard/compte");

  return <AccountPage email={session.user.email} name={session.user.name} />;
}
