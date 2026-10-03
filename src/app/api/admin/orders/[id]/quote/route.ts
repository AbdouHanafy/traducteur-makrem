import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireStaffSession } from "@/lib/rbac";
import { adjustQuote, findOrderById, QuoteLockedError } from "@/repositories/orders";

const schema = z.object({
  pages: z.number().int().min(1).max(500),
  // Total négocié (TND, 3 décimales max) ; absent = on garde le prix unitaire d'origine.
  total: z.number().positive().max(1_000_000).optional(),
  reason: z.string().trim().min(3, "Motif requis.").max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireStaffSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  if (!(await findOrderById(id))) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides.", code: "INVALID_DATA", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const quote = await adjustQuote(id, result.session.user.id, {
      pages: parsed.data.pages,
      manualTotal: parsed.data.total !== undefined ? new Prisma.Decimal(parsed.data.total.toFixed(3)) : undefined,
      reason: parsed.data.reason,
    });
    return NextResponse.json({ ok: true, totalAmount: quote.totalAmount.toString(), advanceAmount: quote.advanceAmount.toString(), balanceAmount: quote.balanceAmount.toString() });
  } catch (error) {
    if (error instanceof QuoteLockedError) return NextResponse.json({ error: error.message, code: "QUOTE_LOCKED" }, { status: 409 });
    if (error instanceof Error && error.message === "NO_CHANGE") return NextResponse.json({ error: "Aucune modification.", code: "NO_CHANGE" }, { status: 400 });
    throw error;
  }
}
