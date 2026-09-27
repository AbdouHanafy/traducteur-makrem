import { prisma } from "@/lib/prisma";

export function listActiveServices() {
  return prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export function findServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export function findServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}
