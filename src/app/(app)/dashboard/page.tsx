import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { listOrdersForUser } from "@/repositories/orders";
import ClientDashboardPage from "@/views/ClientDashboardPage";

export const metadata = buildMetadata({ title: "Mon espace", path: "/dashboard", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  if (session.user.role === "ADMIN") redirect("/admin");

  const orders = await listOrdersForUser(session.user.id);

  return (
    <ClientDashboardPage
      firstName={session.user.firstName}
      orders={orders.map((order) => ({
        id: order.id,
        reference: order.reference,
        status: order.status,
        totalAmount: order.totalAmount.toString(),
        createdAt: order.createdAt.toISOString(),
        service: { name: order.service.name },
      }))}
    />
  );
}
