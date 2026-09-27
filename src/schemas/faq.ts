import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Question requise.").max(300),
  answer: z.string().trim().min(1, "Réponse requise.").max(3000),
  active: z.coerce.boolean(),
});

export type FaqFormInput = z.infer<typeof faqSchema>;
