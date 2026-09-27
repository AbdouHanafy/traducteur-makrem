import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { findOrderById } from "@/repositories/orders";
import AdminOrderDetailPage from "@/views/AdminOrderDetailPage";

export const metadata = buildMetadata({ title: "Commande (admin)", path: "/admin/orders", noIndex: true });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/login?callbackUrl=/admin/orders/${id}`);
  if (session.user.role !== "ADMIN" && session.user.role !== "TRANSLATOR") redirect("/dashboard");

  const order = await findOrderById(id);
  if (!order) notFound();

  return (
    <AdminOrderDetailPage
      order={{
        id: order.id,
        reference: order.reference,
        status: order.status,
        pages: order.pages,
        sourceLang: order.sourceLang,
        targetLang: order.targetLang,
        totalAmount: order.totalAmount.toString(),
        advancePaid: order.advancePaid,
        balancePaid: order.balancePaid,
        user: order.user,
        service: { name: order.service.name },
        documents: order.documents.map((d) => ({ id: d.id, kind: d.kind, originalName: d.originalName })),
      }}
    />
  );
}
