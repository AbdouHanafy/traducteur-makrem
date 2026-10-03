import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderEmail, type EmailTemplate } from "./templates";
import { sendEmail } from "./transport";

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function enqueueEmail(
  db: DbClient,
  input: { recipient: string; template: EmailTemplate; payload: Record<string, string | number | boolean | null> },
) {
  const rendered = renderEmail(input.template, input.payload);
  return db.emailOutbox.create({
    data: {
      recipient: input.recipient.trim().toLowerCase(),
      template: input.template,
      subject: rendered.subject,
      payload: input.payload,
    },
  });
}

export async function processEmailOutbox(limit = 25): Promise<{ sent: number; failed: number }> {
  const now = new Date();
  const candidates = await prisma.emailOutbox.findMany({
    where: {
      availableAt: { lte: now },
      OR: [
        { status: "PENDING" },
        { status: "PROCESSING", lockedAt: { lt: new Date(now.getTime() - 10 * 60_000) } },
      ],
      attempts: { lt: 8 },
    },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(limit, 100)),
  });

  let sent = 0;
  let failed = 0;
  for (const candidate of candidates) {
    const claimed = await prisma.emailOutbox.updateMany({
      where: { id: candidate.id, status: candidate.status, updatedAt: candidate.updatedAt },
      data: { status: "PROCESSING", lockedAt: now, attempts: { increment: 1 } },
    });
    if (claimed.count !== 1) continue;

    try {
      const rendered = renderEmail(candidate.template as EmailTemplate, candidate.payload as Record<string, unknown>);
      await sendEmail({ to: candidate.recipient, subject: rendered.subject, html: rendered.html, text: rendered.text });
      await prisma.emailOutbox.update({
        where: { id: candidate.id },
        data: { status: "SENT", sentAt: new Date(), lockedAt: null, lastError: null },
      });
      sent += 1;
    } catch (error) {
      const attempts = candidate.attempts + 1;
      const terminal = attempts >= 8;
      await prisma.emailOutbox.update({
        where: { id: candidate.id },
        data: {
          status: terminal ? "FAILED" : "PENDING",
          lockedAt: null,
          availableAt: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000),
          lastError: error instanceof Error ? error.message.slice(0, 2000) : "Erreur d'envoi inconnue",
        },
      });
      failed += 1;
    }
  }
  return { sent, failed };
}
