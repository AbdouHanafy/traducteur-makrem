import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export function listAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function updateUserRole(id: string, role: Role) {
  return prisma.user.update({ where: { id }, data: { role } });
}
