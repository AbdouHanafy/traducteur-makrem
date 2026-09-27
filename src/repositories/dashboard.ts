import { prisma } from "@/lib/prisma";

/** Statuts où la balle est dans le camp du traducteur — même définition que la liste
 * commandes (AdminOrdersListPage) pour que les chiffres du tableau de bord ne divergent
 * pas de ce que l'équipe voit en cliquant sur "Commandes". */
const ACTION_NEEDED_STATUSES = ["ACOMPTE_PAYE", "EN_TRADUCTION"] as const;
const WAITING_ON_CLIENT_STATUSES = ["EN_ATTENTE_ACOMPTE", "FICHIER_EN_ATTENTE_DE_SOLDE"] as const;

export async function getDashboardStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    ordersToProcess,
    pendingQuotes,
    waitingOnClient,
    totalOrders,
    totalClients,
    newClientsThisWeek,
    revenueTotal,
    revenueThisMonth,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { in: [...ACTION_NEEDED_STATUSES] } } }),
    prisma.order.count({ where: { status: "DEVIS_A_VALIDER" } }),
    prisma.order.count({ where: { status: { in: [...WAITING_ON_CLIENT_STATUSES] } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "CLIENT", createdAt: { gte: sevenDaysAgo } } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED", confirmedAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        documents: { select: { kind: true, status: true } },
        payments: { select: { phase: true, status: true, amount: true, currency: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return {
    ordersToProcess,
    pendingQuotes,
    waitingOnClient,
    totalOrders,
    totalClients,
    newClientsThisWeek,
    revenueTotal: (revenueTotal._sum.amount ?? 0).toString(),
    revenueThisMonth: (revenueThisMonth._sum.amount ?? 0).toString(),
    recentOrders,
  };
}
