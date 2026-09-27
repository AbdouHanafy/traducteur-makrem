import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listMedia } from "@/repositories/media";
import AdminMediaPage from "@/views/AdminMediaPage";

export const metadata = buildMetadata({ title: "Médiathèque (admin)", path: "/admin/media", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const items = await listMedia();

  return (
    <AdminMediaPage
      items={items.map((i) => ({
        id: i.id,
        url: i.url,
        originalName: i.originalName,
        altText: i.altText,
        sizeBytes: i.sizeBytes,
        createdAt: i.createdAt.toISOString(),
      }))}
    />
  );
}
