import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { writePrivatePreview, writePreviewMeta } from "@/lib/storage/privateStorage";

/**
 * Rendu d'aperçu filigrané — le coeur de la protection anti-copie (voir le fil de discussion
 * produit) : un client peut voir la traduction pour la valider, mais seule une image JPEG
 * basse résolution et filigranée est servie tant que le solde n'est pas payé. Le vrai PDF
 * (route /download) n'est jamais atteignable avant paiement. Aucune protection web ne peut
 * empêcher une capture d'écran — l'objectif ici est de rendre cette capture inutilisable
 * (résolution réduite, filigrane), pas d'empêcher techniquement la capture elle-même.
 *
 * pdfjs-dist + @napi-rs/canvas tournent uniquement côté serveur (voir
 * next.config.ts#serverExternalPackages) — jamais dans le bundle client.
 */
// pdfjs traite cette valeur comme une URL (toujours `/`), jamais un chemin OS : sur Windows,
// `path.join` produirait des `\` que sa validation interne rejette.
const STANDARD_FONT_DATA_URL =
  path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts").split(path.sep).join("/") +
  "/";

export async function renderWatermarkedPdfPreview(
  pdfBytes: Buffer,
  watermarkText: string,
): Promise<Buffer[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(pdfBytes),
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  const pages: Buffer[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");

      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        canvas: canvas as unknown as HTMLCanvasElement,
        viewport,
      }).promise;

      drawWatermark(ctx, canvas.width, canvas.height, watermarkText);

      pages.push(await canvas.encode("jpeg", 72));
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}

/** Rend et persiste l'aperçu filigrané d'un document déjà écrit en stockage privé. */
export async function generateAndStorePreview(
  storageKey: string,
  pdfBuffer: Buffer,
  watermarkText: string,
): Promise<number> {
  const pages = await renderWatermarkedPdfPreview(pdfBuffer, watermarkText);
  for (let i = 0; i < pages.length; i++) {
    await writePrivatePreview(storageKey, i + 1, pages[i]);
  }
  await writePreviewMeta(storageKey, pages.length);
  return pages.length;
}

function drawWatermark(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  width: number,
  height: number,
  text: string,
) {
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = "rgba(180,30,30,0.32)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineHeight = 90;
  for (let i = -2; i <= 2; i++) {
    ctx.fillText(text, 0, i * lineHeight);
  }
  ctx.restore();
}
