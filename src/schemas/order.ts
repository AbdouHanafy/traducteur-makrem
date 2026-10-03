import { z } from "zod";

const LANGUAGES = ["fr", "ar", "en"] as const;

export const createOrderSchema = z.object({
  serviceId: z.string().min(1, "Service requis."),
  sourceLang: z.enum(LANGUAGES),
  targetLang: z.enum(LANGUAGES),
  pages: z.coerce.number().int().min(1, "Au moins 1 page.").max(500),
  delayKey: z.string().min(1, "Délai requis."),
  destinationCountry: z.string().trim().min(2, "Pays de destination requis.").max(100),
  receivingAuthority: z.string().trim().max(160).optional().default(""),
  purpose: z.string().trim().min(3, "Usage prévu requis.").max(1000),
  certificationNeeds: z.enum(["NONE", "CERTIFIED", "LEGALIZATION", "APOSTILLE", "UNSURE"]),
  deliveryMethod: z.enum(["DIGITAL", "PICKUP", "COURIER"]),
  deliveryAddress: z.string().trim().max(1000).optional().default(""),
  clientNotes: z.string().trim().max(3000).optional().default(""),
}).superRefine((data, context) => {
  if (data.sourceLang === data.targetLang) {
    context.addIssue({ code: "custom", message: "Les langues source et cible doivent être différentes.", path: ["targetLang"] });
  }
  if (data.deliveryMethod === "COURIER" && data.deliveryAddress.length < 5) {
    context.addIssue({ code: "custom", message: "Adresse de livraison requise.", path: ["deliveryAddress"] });
  }
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
