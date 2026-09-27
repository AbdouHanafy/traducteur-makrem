import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listOrdersForUser } from "@/repositories/orders";
import OrdersListPage from "@/views/OrdersListPage";

export const metadata = buildMetadata({ title: "Mes commandes", path: "/dashboard/orders", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/dashboard/orders");

  const orders = await listOrdersForUser(session.user.id);

  return (
    <OrdersListPage
      orders={orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        status: o.status,
        totalAmount: o.totalAmount.toString(),
        createdAt: o.createdAt.toISOString(),
        service: { name: o.service.name },
      }))}
    />
  );
}
