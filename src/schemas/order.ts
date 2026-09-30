import { z } from "zod";

const LANGUAGES = ["fr", "ar", "en"] as const;

export const createOrderSchema = z.object({
  serviceId: z.string().min(1, "Service requis."),
  sourceLang: z.enum(LANGUAGES),
  targetLang: z.enum(LANGUAGES),
  pages: z.coerce.number().int().min(1, "Au moins 1 page.").max(500),
  delayKey: z.string().min(1, "Délai requis."),
}).refine((data) => data.sourceLang !== data.targetLang, {
  message: "Les langues source et cible doivent être différentes.",
  path: ["targetLang"],
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
