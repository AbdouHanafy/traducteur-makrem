import { z } from "zod";
import { LOCALES } from "@/lib/i18n";

export const siteContentSchema = z.object({
  locale: z.enum(LOCALES),
  values: z.record(z.string(), z.string().max(10000)),
});
