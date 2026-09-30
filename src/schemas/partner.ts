import { z } from "zod";
import { safeUrlField } from "@/schemas/common";

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(120),
  logoUrl: safeUrlField(500),
  websiteUrl: z.string().trim().url("Adresse web invalide.").max(500).refine((value) => /^https?:\/\//i.test(value), "Utilisez une adresse http ou https.").optional().or(z.literal("")),
  active: z.boolean(),
});

export const partnerMoveSchema = z.object({ direction: z.enum(["up", "down"]) });
