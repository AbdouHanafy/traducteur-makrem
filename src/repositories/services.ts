import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { TranslationsMap } from "@/lib/localize";
import { withTranslations } from "@/repositories/_json";

export function listActiveServices() {
  return prisma.service.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
}

export function listAllServices() {
  return prisma.service.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
}

export function findServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export function findServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}

export interface ServiceInput {
  slug: string;
  name: string;
  description: string;
  pricePerPage: Prisma.Decimal | string;
  imageUrl?: string | null;
  active: boolean;
  translations?: TranslationsMap | null;
}

export async function createService(data: ServiceInput) {
  const last = await prisma.service.findFirst({ orderBy: { order: "desc" } });
  return prisma.service.create({ data: { ...withTranslations(data), order: (last?.order ?? -1) + 1 } });
}

/** Même mécanique de "monter/descendre" que les autres contenus ordonnés du backoffice. */
export async function moveService(id: string, direction: "up" | "down") {
  const items = await prisma.service.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;
  // Renumérote toute la liste : évite les égalités d'ordre (services créés avant la colonne).
  const reordered = [...items];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  await prisma.$transaction(reordered.map((item, position) => prisma.service.update({ where: { id: item.id }, data: { order: position } })));
}

export function updateService(id: string, data: Partial<ServiceInput>) {
  return prisma.service.update({ where: { id }, data: withTranslations(data) });
}

/**
 * Jamais de suppression réelle : un `Service` déjà référencé par une `Order` casserait la
 * relation. Désactiver retire le service de la vente sans perdre l'historique.
 */
export function deactivateService(id: string) {
  return prisma.service.update({ where: { id }, data: { active: false } });
}
