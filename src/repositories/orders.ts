import "server-only";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@prisma/client";
import { enqueueEmail } from "@/lib/email/outbox";

const ORDER_INCLUDE = {
  service: true,
  documents: true,
  payments: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
};

function generateReference(): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `CMD-${year}-${rand}`;
}

export interface CreateOrderInput {
  userId: string;
  serviceId: string;
  sourceLang: string;
  targetLang: string;
  pages: number;
  delayKey: string;
  destinationCountry: string;
  receivingAuthority: string | null;
  purpose: string;
  certificationNeeds: string;
  deliveryMethod: string;
  deliveryAddress: string | null;
  clientNotes: string | null;
  totalAmount: Prisma.Decimal;
  advanceAmount: Prisma.Decimal;
  balanceAmount: Prisma.Decimal;
  document: {
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  };
}

/** Crée la commande + son document source + l'entrée d'historique initiale, en transaction. */
export async function createOrderWithSourceDocument(input: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    // Une collision de référence aléatoire est possible mais improbable (voir @unique) ;
    // deux essais suffisent pour ce volume de commandes attendu.
    let order;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        order = await tx.order.create({
          data: {
            reference: generateReference(),
            userId: input.userId,
            serviceId: input.serviceId,
            sourceLang: input.sourceLang,
            targetLang: input.targetLang,
            pages: input.pages,
            delayKey: input.delayKey,
            destinationCountry: input.destinationCountry,
            receivingAuthority: input.receivingAuthority,
            purpose: input.purpose,
            certificationNeeds: input.certificationNeeds,
            deliveryMethod: input.deliveryMethod,
            deliveryAddress: input.deliveryAddress,
            clientNotes: input.clientNotes,
            status: "DEVIS_A_VALIDER",
            totalAmount: input.totalAmount,
            advanceAmount: input.advanceAmount,
            balanceAmount: input.balanceAmount,
          },
        });
        break;
      } catch (e) {
        // Seule une collision de référence (contrainte unique) justifie un nouvel essai.
        const isCollision = typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
        if (!isCollision || attempt === 1) throw e;
      }
    }
    if (!order) throw new Error("Impossible de créer la commande.");

    await tx.document.create({
      data: {
        orderId: order.id,
        kind: "SOURCE",
        status: "READY",
        storageKey: input.document.storageKey,
        originalName: input.document.originalName,
        mimeType: input.document.mimeType,
        sizeBytes: input.document.sizeBytes,
        sha256: input.document.sha256,
        uploadedById: input.userId,
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "DEVIS_A_VALIDER", actorId: input.userId },
    });

    const user = await tx.user.findUniqueOrThrow({ where: { id: input.userId }, select: { email: true, firstName: true } });
    const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    await enqueueEmail(tx, {
      recipient: user.email,
      template: "ORDER_RECEIVED",
      payload: { name: user.firstName, reference: order.reference, url: `${baseUrl}/dashboard/orders/${order.id}` },
    });

    return order;
  });
}

export function findOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
}

export function listOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });
}

export function listOrdersWithDocumentsForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { service: true, documents: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export function listAllOrders() {
  return prisma.order.findMany({
    include: {
      service: true,
      documents: { select: { kind: true, status: true } },
      payments: { select: { phase: true, status: true, amount: true, currency: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function transitionStatus(
  tx: Prisma.TransactionClient,
  orderId: string,
  status: OrderStatus,
  actorId: string | null,
  note?: string,
  expectedStatus?: OrderStatus,
) {
  if (expectedStatus) {
    // Mise à jour conditionnelle : une requête concurrente ne peut pas rejouer la transition.
    const updated = await tx.order.updateMany({ where: { id: orderId, status: expectedStatus }, data: { status } });
    if (updated.count !== 1) throw new Error("La commande a changé d'état, réessayez.");
  } else {
    await tx.order.update({ where: { id: orderId }, data: { status } });
  }
  await tx.orderStatusHistory.create({ data: { orderId, status, actorId, note } });
}

/** Client accepte le devis : DEVIS_A_VALIDER -> EN_ATTENTE_ACOMPTE. */
export async function acceptQuote(orderId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status !== "DEVIS_A_VALIDER") {
      throw new Error("Ce devis ne peut plus être accepté.");
    }
    await transitionStatus(tx, orderId, "EN_ATTENTE_ACOMPTE", actorId, undefined, "DEVIS_A_VALIDER");
    const user = await tx.user.findUniqueOrThrow({ where: { id: order.userId }, select: { email: true, firstName: true } });
    const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    await enqueueEmail(tx, {
      recipient: user.email,
      template: "QUOTE_ACCEPTED",
      payload: { name: user.firstName, reference: order.reference, url: `${baseUrl}/dashboard/orders/${order.id}` },
    });
  });
}

/** Le traducteur démarre le travail. */
export async function startTranslation(orderId: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status !== "ACOMPTE_PAYE") {
      throw new Error("La traduction ne peut démarrer qu'après paiement de l'acompte.");
    }
    await transitionStatus(tx, orderId, "EN_TRADUCTION", actorId, undefined, "ACOMPTE_PAYE");
  });
}

/** Le traducteur dépose le fichier final : crée le Document(TRANSLATED) + transitions auto. */
export async function attachTranslatedDocument(
  orderId: string,
  actorId: string,
  document: CreateOrderInput["document"],
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status !== "EN_TRADUCTION") {
      throw new Error("La commande n'est pas en cours de traduction.");
    }

    await transitionStatus(tx, orderId, "TRADUCTION_TERMINEE", actorId, undefined, "EN_TRADUCTION");

    await tx.document.create({
      data: {
        orderId,
        kind: "TRANSLATED",
        status: "READY",
        storageKey: document.storageKey,
        originalName: document.originalName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        sha256: document.sha256,
        uploadedById: actorId,
      },
    });

    // Automatique : en attente du paiement du solde pour déverrouiller le téléchargement.
    await transitionStatus(tx, orderId, "FICHIER_EN_ATTENTE_DE_SOLDE", null);
    const user = await tx.user.findUniqueOrThrow({ where: { id: order.userId }, select: { email: true, firstName: true } });
    const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    await enqueueEmail(tx, {
      recipient: user.email,
      template: "TRANSLATION_READY",
      payload: { name: user.firstName, reference: order.reference, url: `${baseUrl}/dashboard/orders/${order.id}` },
    });
  });
}
