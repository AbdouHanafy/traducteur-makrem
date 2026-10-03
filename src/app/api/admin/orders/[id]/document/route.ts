import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/rbac";
import { limit, rejectOversize, HOUR } from "@/lib/rate-limit";
import { findOrderById, attachTranslatedDocument, replaceTranslatedDocument } from "@/repositories/orders";
import { validateUpload, UploadValidationError, MAX_UPLOAD_BYTES } from "@/lib/upload";
import { deletePrivateFile, writePrivateFile, readPrivateFile } from "@/lib/storage/privateStorage";
import { generateAndStorePreview } from "@/lib/pdf-preview";
import { assertMalwareFree } from "@/lib/malware-scan";
import { renderClientPreview } from "@/lib/pdf-preview";
import { writeClientPreview } from "@/lib/storage/privateStorage";

/**
 * Dépôt du fichier final par le traducteur — jamais déclenché par un bouton client (voir
 * l'anti-pattern §1.2 du prototype original). Une copie filigranée est générée pour le
 * contrôle interne admin, mais elle n'est jamais exposée au client avant paiement.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireStaffSession();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const blocked = limit(request, "admin-upload", { userId: result.session.user.id, perUser: [60, HOUR] });
  if (blocked) return blocked;
  const oversize = rejectOversize(request, MAX_UPLOAD_BYTES);
  if (oversize) return oversize;

  const order = await findOrderById(id);
  if (!order) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
  }

  let upload;
  try {
    upload = await validateUpload(file);
    await assertMalwareFree(upload.buffer, upload.mimeType, upload.sha256);
  } catch (e) {
    if (e instanceof UploadValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Analyse de sécurité impossible." }, { status: 422 });
  }

  const storageKey = await writePrivateFile(upload.buffer, upload.extension);

  try {
    // Après une demande de modification du client, le dépôt remplace la version précédente.
    const save = order.revisionRequestedAt ? replaceTranslatedDocument : attachTranslatedDocument;
    await save(order.id, result.session.user.id, {
      storageKey,
      originalName: file.name,
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
      sha256: upload.sha256,
    });
  } catch (e) {
    await deletePrivateFile(storageKey);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur." }, { status: 409 });
  }

  if (upload.mimeType === "application/pdf") {
    try {
      const buffer = await readPrivateFile(storageKey);
      await generateAndStorePreview(storageKey, buffer, `COPIE INTERNE - ${order.reference}`);
    } catch (e) {
      // La commande a déjà transitionné (fichier bien enregistré) : un échec de rendu
      // d'aperçu ne doit pas faire perdre le dépôt, juste être visible dans les logs.
      console.error("Échec de génération de l'aperçu filigrané :", e);
    }
  }

  // Copie d'aperçu sans cachet ni signature, fournie par le traducteur (obligatoire pour un scan).
  const previewCopy = formData.get("previewCopy");
  if (previewCopy instanceof File && previewCopy.size > 0) {
    try {
      const copy = await validateUpload(previewCopy);
      await assertMalwareFree(copy.buffer, copy.mimeType, copy.sha256);
      const pages = await renderClientPreview(copy.buffer, copy.mimeType, order.reference, { allowImage: true });
      await writeClientPreview(storageKey, pages);
    } catch (e) {
      console.error("Échec de génération de l'aperçu client depuis la copie fournie :", e);
      return NextResponse.json({ ok: true, previewCopyFailed: true });
    }
  }

  return NextResponse.json({ ok: true });
}
