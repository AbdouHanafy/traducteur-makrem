import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/rbac";
import { findMediaById, deleteMedia, isMediaInUse } from "@/repositories/media";
import { deletePublicMedia } from "@/lib/storage/publicStorage";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const media = await findMediaById(id);
  if (!media) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  if (await isMediaInUse(media.url)) {
    return NextResponse.json({ error: "Ce média est encore utilisé sur le site. Retirez-le d'abord." }, { status: 409 });
  }

  await deleteMedia(id);
  await deletePublicMedia(media.url);

  revalidateSite();
  return NextResponse.json({ ok: true });
}
