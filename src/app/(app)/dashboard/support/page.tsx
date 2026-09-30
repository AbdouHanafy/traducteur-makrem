import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import SupportPage from "@/views/SupportPage";

export const metadata = buildMetadata({ title: "Support", path: "/dashboard/support", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/dashboard/support");

  return <SupportPage />;
}
