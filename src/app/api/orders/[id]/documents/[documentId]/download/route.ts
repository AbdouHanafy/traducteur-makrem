import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findOrderById } from "@/repositories/orders";
import { findDocumentById } from "@/repositories/documents";
import { readPrivateFile } from "@/lib/storage/privateStorage";

/**
 * Téléchargement du fichier réel — les 5 vérifications de ARCHITECTURE.md §5 :
 * 1) session valide, 2) order.userId === session.user.id (ou staff), 3) solde payé si
 * TRANSLATED, 4) document prêt, 5) lecture par storageKey path-traversal-safe + stream.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id, documentId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const order = await findOrderById(id);
  if (!order) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const isStaff = session.user.role === "ADMIN" || session.user.role === "TRANSLATOR";
  if (order.userId !== session.user.id && !isStaff) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const document = await findDocumentById(documentId);
  if (!document || document.orderId !== order.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  if (document.kind === "TRANSLATED" && !order.balancePaid && !isStaff) {
    return NextResponse.json({ error: "Solde requis pour télécharger ce fichier." }, { status: 403 });
  }

  if (document.status !== "READY") {
    return NextResponse.json({ error: "Document indisponible." }, { status: 409 });
  }

  const buffer = await readPrivateFile(document.storageKey);

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "DOCUMENT_DOWNLOADED",
      resource: `document:${document.id}`,
      metadata: { orderId: order.id, orderReference: order.reference },
    },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
