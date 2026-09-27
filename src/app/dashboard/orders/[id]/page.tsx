import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { findOrderById } from "@/repositories/orders";
import OrderDetailPage from "@/views/OrderDetailPage";

export const metadata = buildMetadata({ title: "Détail de la commande", path: "/dashboard/orders", noIndex: true });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/login?callbackUrl=/dashboard/orders/${id}`);

  const order = await findOrderById(id);
  if (!order || order.userId !== session.user.id) notFound();

  return (
    <OrderDetailPage
      order={{
        id: order.id,
        reference: order.reference,
        status: order.status,
        sourceLang: order.sourceLang,
        targetLang: order.targetLang,
        pages: order.pages,
        totalAmount: order.totalAmount.toString(),
        advanceAmount: order.advanceAmount.toString(),
        balanceAmount: order.balanceAmount.toString(),
        advancePaid: order.advancePaid,
        balancePaid: order.balancePaid,
        service: { name: order.service.name },
        documents: order.documents.map((d) => ({ id: d.id, kind: d.kind, originalName: d.originalName })),
        statusHistory: order.statusHistory.map((h) => ({
          status: h.status,
          createdAt: h.createdAt.toISOString(),
        })),
      }}
    />
  );
}
