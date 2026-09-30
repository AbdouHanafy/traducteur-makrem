import { prisma } from "@/lib/prisma";

export { DELAY_OPTIONS, type DelayKey } from "@/lib/delay-options";

export function listActivePricingRules() {
  return prisma.pricingRule.findMany({ where: { active: true } });
}

export function findPricingRuleByKey(key: string) {
  return prisma.pricingRule.findUnique({ where: { key } });
}
