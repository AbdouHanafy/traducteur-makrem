import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { movePartner } from "@/repositories/partners";
import { partnerMoveSchema } from "@/schemas/partner";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  const parsed = partnerMoveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Direction invalide." }, { status: 400 });
  const { id } = await params;
  await movePartner(id, parsed.data.direction);
  return NextResponse.json({ ok: true });
}
