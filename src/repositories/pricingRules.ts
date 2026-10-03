import "server-only";

import { prisma } from "@/lib/prisma";

export { DELAY_OPTIONS, type DelayKey } from "@/lib/delay-options";

export function listActivePricingRules() {
  return prisma.pricingRule.findMany({ where: { active: true } });
}

export function findPricingRuleByKey(key: string) {
  return prisma.pricingRule.findUnique({ where: { key } });
}

export function listAllPricingRules() {
  return prisma.pricingRule.findMany({ orderBy: { multiplier: "asc" } });
}

/**
 * Modifie le coefficient / l'activation d'un délai. Ne touche jamais aux commandes existantes :
 * le montant de chaque commande est figé à sa création (snapshot financier).
 */
export async function updatePricingRule(key: string, input: { multiplier: number; active: boolean }, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.pricingRule.findUniqueOrThrow({ where: { key } });
    if (!input.active) {
      const otherActive = await tx.pricingRule.count({ where: { active: true, NOT: { key } } });
      if (otherActive === 0) throw new Error("LAST_ACTIVE_RULE");
    }
    const after = await tx.pricingRule.update({ where: { key }, data: { multiplier: input.multiplier.toFixed(3), active: input.active } });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "PRICING_RULE_UPDATED",
        resource: `pricingRule:${key}`,
        metadata: { before: { multiplier: before.multiplier?.toString() ?? null, active: before.active }, after: { multiplier: after.multiplier?.toString() ?? null, active: after.active } },
      },
    });
    return after;
  });
}
