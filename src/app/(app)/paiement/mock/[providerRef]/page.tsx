import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { findPaymentByProviderRef } from "@/repositories/payments";
import { findOrderById } from "@/repositories/orders";
import MockPaymentPage from "@/views/MockPaymentPage";

export const metadata = buildMetadata({ title: "Paiement", path: "/paiement/mock", noIndex: true });

export default async function Page({ params }: { params: Promise<{ providerRef: string }> }) {
  const { providerRef } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const payment = await findPaymentByProviderRef(providerRef);
  if (!payment) notFound();

  const order = await findOrderById(payment.orderId);
  if (!order || order.userId !== session.user.id) notFound();

  if (payment.status === "SUCCEEDED") {
    redirect(`/dashboard/orders/${order.id}`);
  }

  return (
    <MockPaymentPage
      payment={{
        providerRef: payment.providerRef,
        orderId: order.id,
        orderReference: order.reference,
        phase: payment.phase,
        amount: payment.amount.toString(),
      }}
    />
  );
}
