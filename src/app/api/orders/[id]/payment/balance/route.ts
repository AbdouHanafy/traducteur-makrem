import { NextResponse } from "next/server";
import { requireOrderOwner } from "@/lib/rbac";
import { limit, MINUTE } from "@/lib/rate-limit";
import { ensureClientPreview } from "@/lib/client-preview";
import { PaymentAlreadyConfirmedError, startOrderPayment } from "@/lib/payments/start";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOrderOwner(id);

  if ("error" in result) {
    const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const blocked = limit(request, "payment", { userId: result.session.user.id, perUser: [20, 10 * MINUTE] });
  if (blocked) return blocked;

  const { order } = result;

  if (order.status !== "FICHIER_EN_ATTENTE_DE_SOLDE" || order.balancePaid) {
    return NextResponse.json({ error: "Solde non exigible pour cette commande." }, { status: 409 });
  }

  if (order.revisionRequestedAt) {
    return NextResponse.json({ error: "Une modification est en cours : le solde sera exigible après la nouvelle version.", code: "REVISION_PENDING" }, { status: 409 });
  }

  // Le client doit avoir vu l'aperçu avant de payer. Si l'aperçu ne peut pas être généré, on ne bloque jamais le paiement.
  if (!order.previewViewedAt) {
    const translated = order.documents.find((d) => d.kind === "TRANSLATED" && d.status === "READY");
    if (translated) {
      const available = await ensureClientPreview(translated, order.reference).then(() => true, () => false);
      if (available) return NextResponse.json({ error: "Consultez l'aperçu de la traduction avant de payer.", code: "PREVIEW_REQUIRED" }, { status: 409 });
    }
  }

  try {
    return NextResponse.json(await startOrderPayment(order, "BALANCE"));
  } catch (error) {
    if (error instanceof PaymentAlreadyConfirmedError) {
      return NextResponse.json({ error: error.message, code: "PAYMENT_ALREADY_CONFIRMED" }, { status: 409 });
    }
    console.error(JSON.stringify({ level: "error", event: "payment_start_failed", orderId: order.id, message: error instanceof Error ? error.message : "unknown" }));
    return NextResponse.json({ error: "Le paiement n'a pas pu être initialisé. Réessayez dans un instant.", code: "PAYMENT_UNAVAILABLE" }, { status: 502 });
  }
}
