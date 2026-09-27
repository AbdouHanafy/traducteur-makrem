import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { getTranslatedFileAccess } from "@/lib/order-file-access";
import { listOrdersWithDocumentsForUser } from "@/repositories/orders";
import FilesPage from "@/views/FilesPage";

export const metadata = buildMetadata({ title: "Mes fichiers", path: "/dashboard/fichiers", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/dashboard/fichiers");

  const orders = await listOrdersWithDocumentsForUser(session.user.id);

  return (
    <FilesPage
      orders={orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        service: { name: o.service.name },
        balancePaid: getTranslatedFileAccess(o) === "UNLOCKED",
        documents: o.documents.map((d) => ({ id: d.id, kind: d.kind, originalName: d.originalName })),
      }))}
    />
  );
}
