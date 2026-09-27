import { z } from "zod";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const articleSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(slugPattern, "Slug invalide (minuscules, chiffres, tirets)."),
  title: z.string().trim().min(1, "Titre requis.").max(200),
  excerpt: z.string().trim().min(1, "Résumé requis.").max(400),
  body: z.string().trim().min(1, "Contenu requis.").max(20000),
  coverImageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  published: z.coerce.boolean(),
});

export type ArticleFormInput = z.infer<typeof articleSchema>;
