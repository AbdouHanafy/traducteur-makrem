import { prisma } from "@/lib/prisma";
import type { TranslationsMap } from "@/lib/localize";
import { withTranslations } from "@/repositories/_json";

export function listActiveTestimonials() {
  return prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export function listAllTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { order: "asc" } });
}

export function findTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export interface TestimonialInput {
  authorName: string;
  authorRole?: string | null;
  quote: string;
  rating?: number | null;
  active: boolean;
  translations?: TranslationsMap | null;
}

export async function createTestimonial(data: TestimonialInput) {
  const last = await prisma.testimonial.findFirst({ orderBy: { order: "desc" } });
  return prisma.testimonial.create({ data: { ...withTranslations(data), order: (last?.order ?? -1) + 1 } });
}

export function updateTestimonial(id: string, data: TestimonialInput) {
  return prisma.testimonial.update({ where: { id }, data: withTranslations(data) });
}

export function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

/** Même mécanique que FaqItem#moveFaq. */
export async function moveTestimonial(id: string, direction: "up" | "down") {
  const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;


  const reordered = [...items];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  // Renumérote toute la liste : deux éléments à égalité d'ordre ne bloquent plus le déplacement.
  await prisma.$transaction(reordered.map((item, position) => prisma.testimonial.update({ where: { id: item.id }, data: { order: position } })));
}
