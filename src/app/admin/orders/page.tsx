import { buildMetadata } from "@/lib/seo";
import { getTranslatedFileAccess } from "@/lib/order-file-access";
import { listAllOrders } from "@/repositories/orders";
import AdminOrdersListPage from "@/views/AdminOrdersListPage";

export const metadata = buildMetadata({ title: "Commandes (admin)", path: "/admin/orders", noIndex: true });

export default async function Page() {
  const orders = await listAllOrders();

  return (
    <AdminOrdersListPage
      orders={orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        status: o.status,
        fileAccess: getTranslatedFileAccess(o),
        totalAmount: o.totalAmount.toString(),
        service: { name: o.service.name },
        user: o.user,
      }))}
    />
  );
}
