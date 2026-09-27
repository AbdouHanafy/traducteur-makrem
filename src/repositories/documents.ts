import { prisma } from "@/lib/prisma";
import type { DocumentKind } from "@prisma/client";

export interface CreateDocumentInput {
  orderId: string;
  kind: DocumentKind;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  uploadedById: string;
}

export function createDocument(data: CreateDocumentInput) {
  // Pas de pipeline d'antivirus asynchrone dans cette itération (DocumentStatus.SCANNING
  // n'est jamais utilisé) : la validation MIME réelle par magic bytes à l'upload (voir
  // schemas/upload.ts) est le seul filet de sécurité pour l'instant.
  return prisma.document.create({ data: { ...data, status: "READY" } });
}

export function findDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

export function listDocumentsForOrder(orderId: string) {
  return prisma.document.findMany({ where: { orderId }, orderBy: { createdAt: "asc" } });
}
