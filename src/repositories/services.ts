import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export function listActiveServices() {
  return prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export function listAllServices() {
  return prisma.service.findMany({ orderBy: { name: "asc" } });
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
}

export function createService(data: ServiceInput) {
  return prisma.service.create({ data });
}

export function updateService(id: string, data: Partial<ServiceInput>) {
  return prisma.service.update({ where: { id }, data });
}

/**
 * Jamais de suppression réelle : un `Service` déjà référencé par une `Order` casserait la
 * relation. Désactiver retire le service de la vente sans perdre l'historique.
 */
export function deactivateService(id: string) {
  return prisma.service.update({ where: { id }, data: { active: false } });
}
