import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { moveService } from "@/repositories/services";
import { revalidateSite } from "@/lib/cache";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const direction = body?.direction;
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "direction invalide." }, { status: 400 });
  }

  await moveService(id, direction);
  revalidateSite();
  return NextResponse.json({ ok: true });
}
