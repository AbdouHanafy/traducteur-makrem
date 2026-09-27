import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/rbac";
import { buildMetadata } from "@/lib/seo";
import { getDashboardStats } from "@/repositories/dashboard";
import AdminDashboardPage from "@/views/AdminDashboardPage";

export const metadata = buildMetadata({ title: "Tableau de bord (admin)", path: "/admin", noIndex: true });

export default async function Page() {
  // Le chiffre d'affaires et les opérations sont réunis dans l'espace de l'admin-traducteur.
  const result = await requireAdminSession();
  if ("error" in result) redirect("/admin/orders");

  const stats = await getDashboardStats();

  return (
    <AdminDashboardPage
      stats={{
        ordersToProcess: stats.ordersToProcess,
        pendingQuotes: stats.pendingQuotes,
        waitingOnClient: stats.waitingOnClient,
        totalOrders: stats.totalOrders,
        totalClients: stats.totalClients,
        newClientsThisWeek: stats.newClientsThisWeek,
        revenueTotal: stats.revenueTotal,
        revenueThisMonth: stats.revenueThisMonth,
        recentOrders: stats.recentOrders.map((o) => ({
          id: o.id,
          reference: o.reference,
          status: o.status,
          totalAmount: o.totalAmount.toString(),
          createdAt: o.createdAt.toISOString(),
          service: { name: o.service.name },
          user: { firstName: o.user.firstName, lastName: o.user.lastName, email: o.user.email },
        })),
      }}
    />
  );
}
