import { z } from "zod";
import { translationsField } from "@/schemas/common";
import { TRANSLATABLE_FIELDS } from "@/lib/localize";

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(1, "Nom requis.").max(120),
  authorRole: z.string().trim().max(150).optional().or(z.literal("")),
  quote: z.string().trim().min(1, "Avis requis.").max(1000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  active: z.boolean(),
  translations: translationsField(TRANSLATABLE_FIELDS.testimonial),
});

export type TestimonialFormInput = z.infer<typeof testimonialSchema>;
