import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";

/**
 * Validation d'upload — MIME réel par magic bytes (jamais l'extension ni le
 * `Content-Type` déclaré par le navigateur), taille, empreinte SHA-256 pour l'audit.
 * Voir ARCHITECTURE.md §5.
 */
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 Mo

export interface ValidatedUpload {
  buffer: Buffer;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

export class UploadValidationError extends Error {}

export async function validateUpload(file: File): Promise<ValidatedUpload> {
  if (file.size === 0) throw new UploadValidationError("Fichier vide.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("Fichier trop volumineux (20 Mo maximum).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected || !(detected.mime in ALLOWED_MIME_TO_EXT)) {
    throw new UploadValidationError(
      "Format de fichier non supporté (PDF, JPEG ou PNG uniquement).",
    );
  }

  return {
    buffer,
    extension: ALLOWED_MIME_TO_EXT[detected.mime],
    mimeType: detected.mime,
    sizeBytes: buffer.byteLength,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}
