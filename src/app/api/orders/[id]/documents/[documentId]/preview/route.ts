import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findOrderById } from "@/repositories/orders";
import { findDocumentById } from "@/repositories/documents";
import { previewStorageKey, readPreviewMeta, readPrivateFile } from "@/lib/storage/privateStorage";

/**
 * Aperçu réservé à l'admin. Avant paiement, aucun contenu de la traduction finale n'est
 * transmis au navigateur du client : l'interface affiche uniquement un coffre verrouillé.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id, documentId } = await params;
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const order = await findOrderById(id);
  if (!order) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const isStaff = session.user.role === "ADMIN";
  if (!isStaff) {
    return NextResponse.json({ error: "Aperçu verrouillé jusqu'au paiement du solde." }, { status: 423 });
  }

  const document = await findDocumentById(documentId);
  if (!document || document.orderId !== order.id || document.kind !== "TRANSLATED") {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const meta = await readPreviewMeta(document.storageKey);
  if (!meta || page < 1 || page > meta.pageCount) {
    return NextResponse.json({ error: "Aperçu indisponible." }, { status: 404 });
  }

  const buffer = await readPrivateFile(previewStorageKey(document.storageKey, page));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store",
      "X-Preview-Page-Count": String(meta.pageCount),
    },
  });
}
