import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/rbac";
import { findOrderById, attachTranslatedDocument } from "@/repositories/orders";
import { validateUpload, UploadValidationError } from "@/lib/upload";
import { writePrivateFile, readPrivateFile } from "@/lib/storage/privateStorage";
import { generateAndStorePreview } from "@/lib/pdf-preview";

/**
 * Dépôt du fichier final par le traducteur — jamais déclenché par un bouton client (voir
 * l'anti-pattern §1.2 du prototype original). Génère aussi l'aperçu filigrané immédiatement
 * pour que le client puisse valider le fichier sans attendre.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireStaffSession();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

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
  } catch (e) {
    if (e instanceof UploadValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }

  const storageKey = await writePrivateFile(upload.buffer, upload.extension);

  try {
    await attachTranslatedDocument(order.id, result.session.user.id, {
      storageKey,
      originalName: file.name,
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
      sha256: upload.sha256,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur." }, { status: 409 });
  }

  if (upload.mimeType === "application/pdf") {
    try {
      const buffer = await readPrivateFile(storageKey);
      await generateAndStorePreview(storageKey, buffer, "APERÇU - NON PAYÉ");
    } catch (e) {
      // La commande a déjà transitionné (fichier bien enregistré) : un échec de rendu
      // d'aperçu ne doit pas faire perdre le dépôt, juste être visible dans les logs.
      console.error("Échec de génération de l'aperçu filigrané :", e);
    }
  }

  return NextResponse.json({ ok: true });
}
