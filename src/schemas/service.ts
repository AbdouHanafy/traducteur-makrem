import { z } from "zod";
import { safeUrlField, translationsField } from "@/schemas/common";
import { TRANSLATABLE_FIELDS } from "@/lib/localize";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const serviceSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(slugPattern, "Slug invalide (minuscules, chiffres, tirets)."),
  name: z.string().trim().min(1, "Nom requis.").max(120),
  description: z.string().trim().min(1, "Description requise.").max(2000),
  pricePerPage: z.coerce.number().min(0).max(9999),
  imageUrl: safeUrlField(500),
  active: z.boolean(),
  translations: translationsField(TRANSLATABLE_FIELDS.service),
});

export type ServiceFormInput = z.infer<typeof serviceSchema>;
