import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findOrderById } from "@/repositories/orders";
import { findDocumentById } from "@/repositories/documents";
import { previewStorageKey, readPreviewMeta, readPrivateFile } from "@/lib/storage/privateStorage";

/**
 * Aperçu filigrané — jamais le vrai fichier. Servi à l'acheteur (et au staff) même avant
 * paiement du solde, pour qu'il puisse valider que la traduction est la bonne : c'est
 * exactement le rôle du "cadenas" côté client (voir le fil produit) — voir ce qu'il achète,
 * sans pouvoir l'emporter.
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

  const isStaff = session.user.role === "ADMIN" || session.user.role === "TRANSLATOR";
  if (order.userId !== session.user.id && !isStaff) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
