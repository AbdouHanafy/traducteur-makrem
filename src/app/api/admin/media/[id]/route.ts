import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { findMediaById, deleteMedia } from "@/repositories/media";
import { deletePublicMedia } from "@/lib/storage/publicStorage";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const media = await findMediaById(id);
  if (!media) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await deleteMedia(id);
  await deletePublicMedia(media.url);

  return NextResponse.json({ ok: true });
}
