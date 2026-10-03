import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { limit, MINUTE } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { findDocumentById } from "@/repositories/documents";
import { ensureClientPreview, readClientPreviewPage } from "@/lib/client-preview";

const NO_STORE = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex" };

/**
 * Aperçu filigrané du document traduit, réservé au propriétaire de la commande tant que le solde est
 * dû. `?meta=1` → nombre de pages ; `?page=N` → image JPEG basse résolution de la page N. Le fichier
 * réel n'est jamais servi ici (voir la route /download, verrouillée par le solde).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const { id, documentId } = await params;
  const result = await requireOrderOwner(id);
  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }
  const { order, session } = result;

  const blocked = limit(request, "client-preview", { userId: session.user.id, perUser: [400, 10 * MINUTE] });
  if (blocked) return blocked;

  const document = await findDocumentById(documentId);
  if (!document || document.orderId !== order.id || document.kind !== "TRANSLATED" || document.status !== "READY") {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
  if (order.status !== "FICHIER_EN_ATTENTE_DE_SOLDE") {
    return NextResponse.json({ error: "Aperçu indisponible." }, { status: 409 });
  }

  let meta: { pageCount: number };
  try {
    meta = await ensureClientPreview(document, order.reference);
  } catch (error) {
    console.error(JSON.stringify({ level: "error", event: "client_preview_failed", orderId: order.id, message: error instanceof Error ? error.message : "unknown" }));
    return NextResponse.json({ error: "Aperçu indisponible.", code: "PREVIEW_UNAVAILABLE" }, { status: 503, headers: NO_STORE });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("meta")) {
    return NextResponse.json({ pageCount: meta.pageCount }, { headers: NO_STORE });
  }

  const pageNumber = Number(url.searchParams.get("page") ?? "1");
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > meta.pageCount) {
    return NextResponse.json({ error: "Page invalide." }, { status: 400 });
  }
  const image = await readClientPreviewPage(document.storageKey, pageNumber);
  if (!image) return NextResponse.json({ error: "Aperçu indisponible." }, { status: 503, headers: NO_STORE });

  // Première consultation : c'est ce qui permet ensuite de payer (le client a bien vu ce qu'il règle).
  const first = await prisma.order.updateMany({ where: { id: order.id, previewViewedAt: null }, data: { previewViewedAt: new Date() } });
  if (first.count === 1) {
    await prisma.auditLog.create({
      data: { actorId: session.user.id, action: "PREVIEW_VIEWED", resource: `order:${order.id}`, metadata: { documentId: document.id } },
    });
  }

  return new NextResponse(new Uint8Array(image), {
    headers: { ...NO_STORE, "Content-Type": "image/jpeg", "Content-Disposition": "inline", "Content-Length": String(image.byteLength) },
  });
}
