import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";

/**
 * Validation d'upload — MIME réel par magic bytes (jamais l'extension ni le
 * `Content-Type` déclaré par le navigateur), taille, empreinte SHA-256 pour l'audit.
 * Voir ARCHITECTURE.md §5.
 */
const DOCUMENT_MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 Mo
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 Mo

export interface ValidatedUpload {
  buffer: Buffer;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

/** `code` permet au front de traduire le message (app.err.<code>) dans la langue du visiteur. */
export class UploadValidationError extends Error {
  constructor(message: string, readonly code: "FILE_EMPTY" | "FILE_TOO_LARGE" | "FILE_BAD_TYPE") {
    super(message);
  }
}

async function validateAgainst(
  file: File,
  allowed: Record<string, string>,
  maxBytes: number,
  formatMessage: string,
): Promise<ValidatedUpload> {
  if (file.size === 0) throw new UploadValidationError("Fichier vide.", "FILE_EMPTY");
  if (file.size > maxBytes) {
    throw new UploadValidationError(`Fichier trop volumineux (${Math.floor(maxBytes / 1024 / 1024)} Mo maximum).`, "FILE_TOO_LARGE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected || !(detected.mime in allowed)) {
    throw new UploadValidationError(formatMessage, "FILE_BAD_TYPE");
  }

  return {
    buffer,
    extension: allowed[detected.mime],
    mimeType: detected.mime,
    sizeBytes: buffer.byteLength,
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

/** Documents client (commande, traduction) — PDF ou image scannée. */
export function validateUpload(file: File): Promise<ValidatedUpload> {
  return validateAgainst(
    file,
    DOCUMENT_MIME_TO_EXT,
    MAX_UPLOAD_BYTES,
    "Format de fichier non supporté (PDF, JPEG ou PNG uniquement).",
  );
}

/** Médiathèque backoffice — images du site uniquement, jamais de PDF. */
export function validateImageUpload(file: File): Promise<ValidatedUpload> {
  return validateAgainst(
    file,
    IMAGE_MIME_TO_EXT,
    MAX_IMAGE_BYTES,
    "Format d'image non supporté (JPEG, PNG ou WebP uniquement).",
  );
}

export const MAX_FONT_BYTES = 1024 * 1024; // 1 Mo

/** Police web WOFF2 : signature "wOF2" vérifiée sur les octets, jamais sur l'extension. */
export async function validateFontUpload(file: File): Promise<{ buffer: Buffer }> {
  if (file.size === 0) throw new UploadValidationError("Fichier vide.", "FILE_EMPTY");
  if (file.size > MAX_FONT_BYTES) throw new UploadValidationError("Police trop volumineuse (1 Mo maximum).", "FILE_TOO_LARGE");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 4).toString("latin1") !== "wOF2") {
    throw new UploadValidationError("Format non supporté : seule une police .woff2 est acceptée.", "FILE_BAD_TYPE");
  }
  return { buffer };
}
