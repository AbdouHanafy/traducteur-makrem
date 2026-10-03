import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrderOwner } from "@/lib/rbac";
import { limit, rejectOversize, HOUR } from "@/lib/rate-limit";
import { requestRevision, RevisionNotAllowedError } from "@/repositories/orders";

const schema = z.object({ note: z.string().trim().min(5).max(2000) });

/** Le client, après avoir consulté l'aperçu, demande une correction au lieu de payer le solde. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOrderOwner(id);
  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const blocked = limit(request, "revision", { userId: result.session.user.id, perUser: [10, HOUR] });
  if (blocked) return blocked;
  const oversize = rejectOversize(request, 16 * 1024);
  if (oversize) return oversize;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Décrivez la modification souhaitée (5 caractères minimum).", code: "INVALID_NOTE" }, { status: 400 });

  try {
    await requestRevision(result.order.id, result.session.user.id, parsed.data.note);
  } catch (error) {
    if (error instanceof RevisionNotAllowedError) return NextResponse.json({ error: error.message, code: "REVISION_NOT_ALLOWED" }, { status: 409 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}
