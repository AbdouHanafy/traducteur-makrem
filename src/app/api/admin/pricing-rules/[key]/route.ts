import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/rbac";
import { revalidateSite } from "@/lib/cache";
import { findPricingRuleByKey, updatePricingRule } from "@/repositories/pricingRules";

const schema = z.object({
  // 0,5 à 5 : au-delà, une faute de frappe (ex. 13 au lieu de 1,3) facturerait n'importe quoi.
  multiplier: z.number().min(0.5).max(5),
  active: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { key } = await params;
  if (!(await findPricingRuleByKey(key))) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Valeurs invalides.", code: "INVALID_DATA" }, { status: 400 });

  try {
    const rule = await updatePricingRule(key, parsed.data, result.session.user.id);
    // La page /commander (statique par langue) affiche les délais actifs : elle doit se régénérer.
    revalidateSite();
    return NextResponse.json({ rule: { key: rule.key, multiplier: rule.multiplier?.toString() ?? "1", active: rule.active } });
  } catch (error) {
    if (error instanceof Error && error.message === "LAST_ACTIVE_RULE") {
      return NextResponse.json({ error: "Au moins un délai doit rester actif.", code: "LAST_ACTIVE_RULE" }, { status: 409 });
    }
    throw error;
  }
}
