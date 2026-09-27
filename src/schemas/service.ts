import { z } from "zod";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const serviceSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(slugPattern, "Slug invalide (minuscules, chiffres, tirets)."),
  name: z.string().trim().min(1, "Nom requis.").max(120),
  description: z.string().trim().min(1, "Description requise.").max(2000),
  pricePerPage: z.coerce.number().min(0).max(9999),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

export type ServiceFormInput = z.infer<typeof serviceSchema>;
