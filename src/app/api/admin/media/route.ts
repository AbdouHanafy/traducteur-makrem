import { NextResponse } from "next/server";
import { revalidateSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/rbac";
import { validateImageUpload, UploadValidationError } from "@/lib/upload";
import { writePublicMedia } from "@/lib/storage/publicStorage";
import { createMedia, listMedia } from "@/repositories/media";

export async function GET() {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const media = await listMedia();
  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis." }, { status: 400 });
  }

  let upload;
  try {
    upload = await validateImageUpload(file);
  } catch (e) {
    if (e instanceof UploadValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }

  const url = await writePublicMedia(upload.buffer, upload.extension);

  const altText = formData.get("altText");
  const media = await createMedia({
    url,
    originalName: file.name,
    mimeType: upload.mimeType,
    sizeBytes: upload.sizeBytes,
    altText: typeof altText === "string" && altText.trim() ? altText.trim() : undefined,
    uploadedById: result.session.user.id,
  });

  revalidateSite();
  return NextResponse.json({ media }, { status: 201 });
}
