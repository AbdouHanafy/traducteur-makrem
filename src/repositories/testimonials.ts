import { prisma } from "@/lib/prisma";

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
}

export async function createTestimonial(data: TestimonialInput) {
  const last = await prisma.testimonial.findFirst({ orderBy: { order: "desc" } });
  return prisma.testimonial.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
}

export function updateTestimonial(id: string, data: TestimonialInput) {
  return prisma.testimonial.update({ where: { id }, data });
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

  const current = items[index];
  const swap = items[swapIndex];

  await prisma.$transaction([
    prisma.testimonial.update({ where: { id: current.id }, data: { order: swap.order } }),
    prisma.testimonial.update({ where: { id: swap.id }, data: { order: current.order } }),
  ]);
}
