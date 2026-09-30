import { z } from "zod";
import { translationsField } from "@/schemas/common";
import { TRANSLATABLE_FIELDS } from "@/lib/localize";

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Question requise.").max(300),
  answer: z.string().trim().min(1, "Réponse requise.").max(3000),
  active: z.boolean(),
  translations: translationsField(TRANSLATABLE_FIELDS.faq),
});

export type FaqFormInput = z.infer<typeof faqSchema>;
