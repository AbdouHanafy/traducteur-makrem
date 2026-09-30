import { prisma } from "@/lib/prisma";
import type { TranslationsMap } from "@/lib/localize";
import { withTranslations } from "@/repositories/_json";
import type { HomeSectionType } from "@prisma/client";

export function listVisibleHomeSections() {
  return prisma.homeSection.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

export function listAllHomeSections() {
  return prisma.homeSection.findMany({ orderBy: { order: "asc" } });
}

export function findHomeSectionById(id: string) {
  return prisma.homeSection.findUnique({ where: { id } });
}

export interface CustomSectionInput {
  eyebrow?: string | null;
  title: string;
  body: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  translations?: TranslationsMap | null;
}

/** Nouvelle section libre ajoutée en dernière position. */
export async function createCustomSection(data: CustomSectionInput) {
  const last = await prisma.homeSection.findFirst({ orderBy: { order: "desc" } });
  return prisma.homeSection.create({
    data: { ...withTranslations(data), type: "CUSTOM", order: (last?.order ?? -1) + 1 },
  });
}

export function updateCustomSection(id: string, data: CustomSectionInput) {
  return prisma.homeSection.update({ where: { id }, data: withTranslations(data) });
}

export function toggleHomeSectionVisibility(id: string, visible: boolean) {
  return prisma.homeSection.update({ where: { id }, data: { visible } });
}

/** Seules les sections CUSTOM peuvent être supprimées — les sections système sont structurelles. */
export async function deleteCustomSection(id: string) {
  const section = await prisma.homeSection.findUnique({ where: { id } });
  if (!section || section.type !== "CUSTOM") {
    throw new Error("Seule une section personnalisée peut être supprimée.");
  }
  await prisma.homeSection.delete({ where: { id } });
}

/** Même mécanique que FaqItem#moveFaq — échange l'ordre avec le voisin direct. */
export async function moveHomeSection(id: string, direction: "up" | "down") {
  const items = await prisma.homeSection.findMany({ orderBy: { order: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;


  const reordered = [...items];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  // Renumérote toute la liste : deux éléments à égalité d'ordre ne bloquent plus le déplacement.
  await prisma.$transaction(reordered.map((item, position) => prisma.homeSection.update({ where: { id: item.id }, data: { order: position } })));
}

export const SYSTEM_SECTION_LABELS: Record<HomeSectionType, string> = {
  HERO: "En-tête (Hero)",
  STATS: "Bande de repères",
  SERVICES: "Nos prestations",
  WORKFLOW: "Comment ça marche",
  STATEMENT: "Citation",
  TESTIMONIALS: "Avis clients (carrousel)",
  FINAL_CTA: "Appel à l'action final",
  CUSTOM: "Section personnalisée",
};
