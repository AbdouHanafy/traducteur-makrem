import "server-only";

import { parseProductionEnv } from "@/lib/env-schema";

/** Validation explicite a appeler au demarrage d'un processus de production. */
export function getProductionEnv() {
  return parseProductionEnv(process.env);
}
