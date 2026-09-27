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

export function deleteMedia(id: string) {
  return prisma.mediaAsset.delete({ where: { id } });
}
