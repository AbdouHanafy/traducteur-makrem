import { z } from "zod";
import { safeUrlField, translationsField } from "@/schemas/common";
import { TRANSLATABLE_FIELDS } from "@/lib/localize";

export const customSectionSchema = z.object({
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  title: z.string().trim().min(1, "Titre requis.").max(160),
  body: z.string().trim().min(1, "Texte requis.").max(4000),
  imageUrl: safeUrlField(500),
  ctaLabel: z.string().trim().max(60).optional().or(z.literal("")),
  ctaHref: safeUrlField(300),
  translations: translationsField(TRANSLATABLE_FIELDS.homeSection),
});

export type CustomSectionFormInput = z.infer<typeof customSectionSchema>;
