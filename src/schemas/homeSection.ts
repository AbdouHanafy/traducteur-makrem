import { z } from "zod";

export const customSectionSchema = z.object({
  eyebrow: z.string().trim().max(80).optional().or(z.literal("")),
  title: z.string().trim().min(1, "Titre requis.").max(160),
  body: z.string().trim().min(1, "Texte requis.").max(4000),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  ctaLabel: z.string().trim().max(60).optional().or(z.literal("")),
  ctaHref: z.string().trim().max(300).optional().or(z.literal("")),
});

export type CustomSectionFormInput = z.infer<typeof customSectionSchema>;
