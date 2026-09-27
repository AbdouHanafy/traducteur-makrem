import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listAllOrders } from "@/repositories/orders";
import AdminOrdersListPage from "@/views/AdminOrdersListPage";

export const metadata = buildMetadata({ title: "Commandes (admin)", path: "/admin/orders", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/admin/orders");
  if (session.user.role !== "ADMIN" && session.user.role !== "TRANSLATOR") redirect("/dashboard");

  const orders = await listAllOrders();

  return (
    <AdminOrdersListPage
      orders={orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        status: o.status,
        totalAmount: o.totalAmount.toString(),
        service: { name: o.service.name },
        user: o.user,
      }))}
    />
  );
}
