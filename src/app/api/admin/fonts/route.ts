import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { revalidateSite } from "@/lib/cache";
import { limit, rejectOversize, HOUR } from "@/lib/rate-limit";
import { MAX_FONT_BYTES, UploadValidationError, validateFontUpload } from "@/lib/upload";
import { deletePublicFont, writePublicFont } from "@/lib/storage/publicStorage";
import { CUSTOM_FONT_SLOTS, type CustomFontSlot } from "@/lib/theme";
import { removeCustomFont, saveCustomFont } from "@/repositories/siteSettings";

function parseSlot(value: unknown): CustomFontSlot | null {
  const slot = Number(value);
  return (CUSTOM_FONT_SLOTS as readonly number[]).includes(slot) ? (slot as CustomFontSlot) : null;
}

/** Téléverse une police personnalisée (.woff2) dans l'emplacement 1 ou 2. */
export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }
  const blocked = limit(request, "admin-font", { userId: result.session.user.id, perUser: [30, HOUR] });
  if (blocked) return blocked;
  const oversize = rejectOversize(request, MAX_FONT_BYTES);
  if (oversize) return oversize;

  const formData = await request.formData();
  const slot = parseSlot(formData.get("slot"));
  const file = formData.get("file");
  const rawName = formData.get("name");
  if (!slot || !(file instanceof File)) return NextResponse.json({ error: "Emplacement et fichier requis." }, { status: 400 });
  // Nom affiché : lettres, chiffres, espaces et tirets seulement (jamais injecté dans du CSS).
  const name = (typeof rawName === "string" ? rawName : "").replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 60);
  if (!name) return NextResponse.json({ error: "Nom de police requis." }, { status: 400 });

  let upload;
  try {
    upload = await validateFontUpload(file);
  } catch (e) {
    if (e instanceof UploadValidationError) return NextResponse.json({ error: e.message, code: e.code }, { status: 400 });
    throw e;
  }

  const url = await writePublicFont(upload.buffer);
  const previous = await saveCustomFont({ slot, name, url });
  if (previous) await deletePublicFont(previous);
  revalidateSite();
  return NextResponse.json({ font: { slot, name, url } }, { status: 201 });
}

/** Supprime la police personnalisée d'un emplacement (les choix qui l'utilisaient reviennent au défaut). */
export async function DELETE(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }
  const slot = parseSlot(new URL(request.url).searchParams.get("slot"));
  if (!slot) return NextResponse.json({ error: "Emplacement invalide." }, { status: 400 });

  const previous = await removeCustomFont(slot);
  if (previous) await deletePublicFont(previous);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
