import { prisma } from "@/lib/prisma";

export function listActivePartners() {
  return prisma.partner.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export function listAllPartners() {
  return prisma.partner.findMany({ orderBy: { order: "asc" } });
}

export function findPartnerById(id: string) {
  return prisma.partner.findUnique({ where: { id } });
}

export async function createPartner(data: { name: string; logoUrl?: string | null; websiteUrl?: string | null; active: boolean }) {
  const last = await prisma.partner.findFirst({ orderBy: { order: "desc" } });
  return prisma.partner.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
}

export function updatePartner(id: string, data: { name: string; logoUrl?: string | null; websiteUrl?: string | null; active: boolean }) {
  return prisma.partner.update({ where: { id }, data });
}

export function deletePartner(id: string) {
  return prisma.partner.delete({ where: { id } });
}

export async function movePartner(id: string, direction: "up" | "down") {
  const items = await prisma.partner.findMany({ orderBy: { order: "asc" } });
  const index = items.findIndex((item) => item.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= items.length) return;
  const reordered = [...items];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  // Renumérote toute la liste : deux éléments à égalité d'ordre ne bloquent plus le déplacement.
  await prisma.$transaction(reordered.map((item, position) => prisma.partner.update({ where: { id: item.id }, data: { order: position } })));
}
