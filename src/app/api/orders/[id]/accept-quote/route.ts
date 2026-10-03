import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { limit, MINUTE } from "@/lib/rate-limit";
import { acceptQuote, QuoteChangedError } from "@/repositories/orders";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOrderOwner(id);

  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const blocked = limit(request, "quote", { userId: result.session.user.id, perUser: [30, 10 * MINUTE] });
  if (blocked) return blocked;

  // Montant que le client a sous les yeux : refusé si le devis a été ajusté entre-temps.
  const body = await request.json().catch(() => null);
  const expectedTotal = typeof body?.expectedTotal === "string" && /^\d+(\.\d{1,3})?$/.test(body.expectedTotal) ? body.expectedTotal : undefined;

  try {
    await acceptQuote(id, result.session.user.id, expectedTotal);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur.", code: e instanceof QuoteChangedError ? "QUOTE_CHANGED" : undefined },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
