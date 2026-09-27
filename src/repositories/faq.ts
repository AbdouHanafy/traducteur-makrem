import { prisma } from "@/lib/prisma";

export function listActiveFaqs() {
  return prisma.faqItem.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export function listAllFaqs() {
  return prisma.faqItem.findMany({ orderBy: { order: "asc" } });
}

export function findFaqById(id: string) {
  return prisma.faqItem.findUnique({ where: { id } });
}

export interface FaqInput {
  question: string;
  answer: string;
  active: boolean;
}

/** Nouvelle question ajoutée en dernière position (ordre max + 1). */
export async function createFaq(data: FaqInput) {
  const last = await prisma.faqItem.findFirst({ orderBy: { order: "desc" } });
  return prisma.faqItem.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
}

export function updateFaq(id: string, data: Partial<FaqInput>) {
  return prisma.faqItem.update({ where: { id }, data });
}

export function deleteFaq(id: string) {
  return prisma.faqItem.delete({ where: { id } });
}

/** Échange l'ordre avec le voisin direct — la seule opération dont a besoin un "monter/descendre". */
export async function moveFaq(id: string, direction: "up" | "down") {
  const items = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swap = items[swapIndex];

  await prisma.$transaction([
    prisma.faqItem.update({ where: { id: current.id }, data: { order: swap.order } }),
    prisma.faqItem.update({ where: { id: swap.id }, data: { order: current.order } }),
  ]);
}
