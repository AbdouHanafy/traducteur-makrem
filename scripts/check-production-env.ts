import { loadEnvConfig } from "@next/env";
import { formatEnvError, parseProductionEnv } from "../src/lib/env-schema";

loadEnvConfig(process.cwd());

try {
  const env = parseProductionEnv(process.env);
  console.log(`Configuration de production valide (${env.paymentProvider}, ${env.authBaseUrl}).`);
} catch (error) {
  console.error("Configuration de production invalide:\n" + formatEnvError(error));
  process.exitCode = 1;
}
