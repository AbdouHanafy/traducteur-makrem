import path from "node:path";
import { readFile } from "node:fs/promises";

/**
 * Sert les fichiers envoyés depuis le backoffice (médiathèque, polices). Next.js ne sert depuis
 * `public/` que les fichiers présents AU DÉMARRAGE : un fichier téléversé pendant l'exécution
 * (production) serait sinon introuvable jusqu'au prochain redémarrage.
 */
const ROOT = path.join(process.cwd(), "public", "uploads");
const SAFE_SEGMENT = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const ALLOWED_DIRS = new Set(["media", "fonts"]);

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  if (segments.length !== 2 || !ALLOWED_DIRS.has(segments[0]) || !segments.every((segment) => SAFE_SEGMENT.test(segment))) {
    return new Response("Not found", { status: 404 });
  }
  const contentType = CONTENT_TYPES[path.extname(segments[1]).toLowerCase()];
  if (!contentType) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(ROOT, segments[0], segments[1]));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        // Noms de fichiers = UUID : le contenu ne change jamais pour une même URL.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
