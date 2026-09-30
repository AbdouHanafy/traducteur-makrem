import { prisma } from "@/lib/prisma";

export function listMedia() {
  return prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
}

export function findMediaById(id: string) {
  return prisma.mediaAsset.findUnique({ where: { id } });
}

export interface CreateMediaInput {
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
  uploadedById: string;
}

export function createMedia(data: CreateMediaInput) {
  return prisma.mediaAsset.create({ data });
}

/** Vrai si l'URL est encore utilisée par un service, article, section d'accueil ou partenaire. */
export async function isMediaInUse(url: string): Promise<boolean> {
  const [services, articles, sections, partners] = await Promise.all([
    prisma.service.count({ where: { imageUrl: url } }),
    prisma.article.count({ where: { coverImageUrl: url } }),
    prisma.homeSection.count({ where: { imageUrl: url } }),
    prisma.partner.count({ where: { logoUrl: url } }),
  ]);
  return services + articles + sections + partners > 0;
}

export function deleteMedia(id: string) {
  return prisma.mediaAsset.delete({ where: { id } });
}
