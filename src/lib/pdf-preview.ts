import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { writePrivatePreview, writePreviewMeta } from "@/lib/storage/privateStorage";

/**
 * Rendu d'une copie de contrôle interne filigranée, réservée à l'administrateur/traducteur.
 * Cet aperçu n'est jamais transmis au client : avant confirmation du solde, l'espace client
 * affiche uniquement l'état verrouillé et ne reçoit aucun octet du document traduit.
 *
 * pdfjs-dist + @napi-rs/canvas tournent uniquement côté serveur (voir
 * next.config.ts#serverExternalPackages) — jamais dans le bundle client.
 */
// pdfjs traite cette valeur comme une URL (toujours `/`), jamais un chemin OS : sur Windows,
// `path.join` produirait des `\` que sa validation interne rejette.
const STANDARD_FONT_DATA_URL =
  path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts").split(path.sep).join("/") +
  "/";

/** Plafond de pages rendues : la copie de contrôle n'a pas besoin de tout le document. */
const MAX_PREVIEW_PAGES = 100;

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
    for (let pageNumber = 1; pageNumber <= Math.min(doc.numPages, MAX_PREVIEW_PAGES); pageNumber++) {
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

/** Rend et persiste la copie de contrôle interne d'un document déjà écrit en stockage privé. */
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

/** Largeur maximale d'une page d'aperçu client : lisible pour vérifier le contenu, inutilisable comme document. */
const CLIENT_PREVIEW_WIDTH = 760;
const CLIENT_PREVIEW_QUALITY = 48;

type Ctx = ReturnType<ReturnType<typeof createCanvas>["getContext"]>;

/** Filigrane dense en mosaïque (impossible à recadrer) + bandeau : l'aperçu ne peut pas servir de document. */
function drawClientWatermark(ctx: Ctx, width: number, height: number, reference: string) {
  const label = `APERÇU – NON VALABLE · ${reference}`;
  ctx.save();
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(160,20,20,0.26)";
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 7);
  const diagonal = Math.hypot(width, height);
  for (let y = -diagonal / 2; y < diagonal / 2; y += 78) {
    for (let x = -diagonal / 2 - ((Math.round(y / 78) % 2) * 170); x < diagonal / 2; x += 340) {
      ctx.strokeText(label, x, y);
      ctx.fillText(label, x, y);
    }
  }
  ctx.restore();
  ctx.fillStyle = "rgba(160,20,20,0.88)";
  ctx.fillRect(0, height - 26, width, 26);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("APERÇU DE VÉRIFICATION – NE PEUT PAS ÊTRE UTILISÉ COMME DOCUMENT", width / 2, height - 13);
}

/** Rend l'aperçu protégé destiné au client (PDF ou image) : basse résolution, JPEG compressé, filigrane en mosaïque. */
export async function renderClientPreview(
  bytes: Buffer,
  mimeType: string,
  reference: string,
  options: { allowImage?: boolean } = {},
): Promise<Buffer[]> {
  if (mimeType.startsWith("image/")) {
    // Un scan contient le cachet et la signature dans l'image elle-même : impossible de les retirer
    // automatiquement. Le traducteur doit fournir une copie d'aperçu sans cachet ni signature.
    if (!options.allowImage) throw new Error("PREVIEW_COPY_REQUIRED");
    const { loadImage } = await import("@napi-rs/canvas");
    const image = await loadImage(bytes);
    const ratio = Math.min(1, CLIENT_PREVIEW_WIDTH / image.width);
    const canvas = createCanvas(Math.round(image.width * ratio), Math.round(image.height * ratio));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    drawClientWatermark(ctx, canvas.width, canvas.height, reference);
    return [await canvas.encode("jpeg", CLIENT_PREVIEW_QUALITY)];
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    useSystemFonts: true,
    disableFontFace: true,
  });
  const doc = await loadingTask.promise;
  const pages: Buffer[] = [];
  let hasContent = false;
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(doc.numPages, MAX_PREVIEW_PAGES); pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: CLIENT_PREVIEW_WIDTH / base.width });
      const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
      const ctx = canvas.getContext("2d");
      // Cachet et signature (images ou annotations) ne figurent JAMAIS dans l'aperçu : une capture d'écran
      // ne doit pas pouvoir servir de document. Seul le texte et les tracés sont rendus.
      await page.render({
        canvasContext: withoutImages(ctx) as unknown as CanvasRenderingContext2D,
        canvas: null as unknown as HTMLCanvasElement,
        viewport,
        annotationMode: pdfjs.AnnotationMode.DISABLE,
      }).promise;
      if (!isBlank(ctx, canvas.width, canvas.height)) hasContent = true;
      drawClientWatermark(ctx, canvas.width, canvas.height, reference);
      pages.push(await canvas.encode("jpeg", CLIENT_PREVIEW_QUALITY));
    }
  } finally {
    await loadingTask.destroy();
  }
  // PDF scanné : une fois les images retirées il ne reste rien à vérifier → copie d'aperçu manuelle requise.
  if (!hasContent) throw new Error("PREVIEW_COPY_REQUIRED");
  return pages;
}

const IMAGE_PAINT_METHODS = new Set(["drawImage", "putImageData"]);

/** Proxy du contexte 2D qui ignore le dessin d'images (cachets, signatures, logos scannés) tout en laissant passer le reste. */
function withoutImages(ctx: Ctx): Ctx {
  return new Proxy(ctx, {
    get(target, prop) {
      if (typeof prop === "string" && IMAGE_PAINT_METHODS.has(prop)) return () => undefined;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    set(target, prop, value) {
      Reflect.set(target, prop, value, target);
      return true;
    },
  });
}

/** Vrai si la page ne contient (presque) aucun pixel non blanc. */
function isBlank(ctx: Ctx, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  let ink = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i] < 200 || data[i + 1] < 200 || data[i + 2] < 200) ink++;
  return ink < (width * height) / 5000;
}
