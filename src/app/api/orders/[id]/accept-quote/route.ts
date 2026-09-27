import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { acceptQuote } from "@/repositories/orders";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOrderOwner(id);

  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  try {
    await acceptQuote(id, result.session.user.id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
