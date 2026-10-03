import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getTranslatedFileAccess, hasConfirmedBalanceProof } from "@/lib/order-file-access";
import { findOrderById } from "@/repositories/orders";
import AdminOrderDetailPage from "@/views/AdminOrderDetailPage";

export const metadata = buildMetadata({ title: "Commande (admin)", path: "/admin/orders", noIndex: true });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
        destinationCountry: order.destinationCountry,
        receivingAuthority: order.receivingAuthority,
        purpose: order.purpose,
        certificationNeeds: order.certificationNeeds,
        deliveryMethod: order.deliveryMethod,
        deliveryAddress: order.deliveryAddress,
        clientNotes: order.clientNotes,
        totalAmount: order.totalAmount.toString(),
        advanceAmount: order.advanceAmount.toString(),
        balanceAmount: order.balanceAmount.toString(),
        advancePaid: order.advancePaid,
        balancePaid: hasConfirmedBalanceProof(order),
        fileAccess: getTranslatedFileAccess(order),
        revision: order.revisionRequestedAt ? { note: order.revisionNote ?? "", requestedAt: order.revisionRequestedAt.toISOString() } : null,
        user: order.user,
        service: { name: order.service.name },
        documents: order.documents.filter((d) => d.kind === "SOURCE" || d.status === "READY").map((d) => ({ id: d.id, kind: d.kind, originalName: d.originalName })),
      }}
    />
  );
}
