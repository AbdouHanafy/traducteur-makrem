import { z } from "zod";
import { safeUrlField, translationsField } from "@/schemas/common";
import { TRANSLATABLE_FIELDS } from "@/lib/localize";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const articleSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(slugPattern, "Slug invalide (minuscules, chiffres, tirets)."),
  title: z.string().trim().min(1, "Titre requis.").max(200),
  excerpt: z.string().trim().min(1, "Résumé requis.").max(400),
  body: z.string().trim().min(1, "Contenu requis.").max(20000),
  coverImageUrl: safeUrlField(500),
  published: z.boolean(),
  translations: translationsField(TRANSLATABLE_FIELDS.article),
});

export type ArticleFormInput = z.infer<typeof articleSchema>;
