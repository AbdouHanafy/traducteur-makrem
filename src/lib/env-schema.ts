import { z } from "zod";

const rawProductionEnvSchema = z
  .object({
    DATABASE_URL: z.string().trim().min(1, "DATABASE_URL est obligatoire."),
    AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().optional(),
    BETTER_AUTH_URL: z.string().optional(),
    PRIVATE_STORAGE_ROOT: z.string().trim().min(1, "PRIVATE_STORAGE_ROOT est obligatoire."),
    REQUIRE_EMAIL_VERIFICATION: z.literal("true", { error: "REQUIRE_EMAIL_VERIFICATION doit valoir true en production." }),
    EMAIL_DELIVERY_MODE: z.string().optional(),
    EMAIL_API_URL: z.url("EMAIL_API_URL doit etre une URL valide."),
    EMAIL_API_KEY: z.string().trim().min(1, "EMAIL_API_KEY est obligatoire."),
    EMAIL_FROM: z.string().trim().min(3, "EMAIL_FROM est obligatoire."),
    JOBS_SECRET: z.string().min(32, "JOBS_SECRET doit contenir au moins 32 caracteres."),
    MALWARE_SCANNER_URL: z.url("MALWARE_SCANNER_URL doit etre une URL valide."),
    MALWARE_SCANNER_TOKEN: z.string().trim().min(1, "MALWARE_SCANNER_TOKEN est obligatoire."),
    PAYMENT_PROVIDER: z.literal("konnect", {
      error: "PAYMENT_PROVIDER doit valoir konnect en production.",
    }),
    KONNECT_ENV: z.literal("production", {
      error: "KONNECT_ENV doit valoir production en production.",
    }),
    KONNECT_API_BASE_URL: z.string().trim().optional(),
    KONNECT_API_KEY: z.string().trim().min(1, "KONNECT_API_KEY est obligatoire."),
    KONNECT_RECEIVER_WALLET_ID: z.string().trim().min(1, "KONNECT_RECEIVER_WALLET_ID est obligatoire."),
    KONNECT_PAYMENT_LIFESPAN_MINUTES: z.coerce.number().int().min(1).max(1440).default(30),
  })
  .superRefine((env, context) => {
    const authSecret = env.AUTH_SECRET || env.BETTER_AUTH_SECRET;
    if (!authSecret || authSecret.length < 32) {
      context.addIssue({
        code: "custom",
        path: ["AUTH_SECRET"],
        message: "AUTH_SECRET (ou BETTER_AUTH_SECRET) doit contenir au moins 32 caracteres.",
      });
    }

    const baseUrl = env.NEXTAUTH_URL || env.BETTER_AUTH_URL;
    if (!baseUrl) {
      context.addIssue({
        code: "custom",
        path: ["NEXTAUTH_URL"],
        message: "NEXTAUTH_URL (ou BETTER_AUTH_URL) est obligatoire.",
      });
    } else {
      try {
        if (new URL(baseUrl).protocol !== "https:") throw new Error();
      } catch {
        context.addIssue({
          code: "custom",
          path: ["NEXTAUTH_URL"],
          message: "L'URL publique de production doit etre une URL HTTPS valide.",
        });
      }
    }

    if (env.KONNECT_API_BASE_URL) {
      try {
        if (new URL(env.KONNECT_API_BASE_URL).protocol !== "https:") throw new Error();
      } catch {
        context.addIssue({
          code: "custom",
          path: ["KONNECT_API_BASE_URL"],
          message: "KONNECT_API_BASE_URL doit etre une URL HTTPS valide lorsqu'elle est definie.",
        });
      }
    }
    for (const [name, value] of [["EMAIL_API_URL", env.EMAIL_API_URL], ["MALWARE_SCANNER_URL", env.MALWARE_SCANNER_URL]] as const) {
      if (new URL(value).protocol !== "https:") {
        context.addIssue({ code: "custom", path: [name], message: `${name} doit utiliser HTTPS en production.` });
      }
    }
    if (env.EMAIL_DELIVERY_MODE === "log") {
      context.addIssue({ code: "custom", path: ["EMAIL_DELIVERY_MODE"], message: "Le mode log est interdit en production." });
    }
  });

export interface ProductionEnv {
  databaseUrl: string;
  authSecret: string;
  authBaseUrl: string;
  privateStorageRoot: string;
  paymentProvider: "konnect";
  konnectEnvironment: "production";
  konnectApiKey: string;
  konnectReceiverWalletId: string;
  konnectPaymentLifespanMinutes: number;
  emailApiUrl: string;
  jobsSecret: string;
  malwareScannerUrl: string;
}

export function parseProductionEnv(source: NodeJS.ProcessEnv): ProductionEnv {
  const env = rawProductionEnvSchema.parse(source);
  return {
    databaseUrl: env.DATABASE_URL,
    authSecret: (env.AUTH_SECRET || env.BETTER_AUTH_SECRET)!,
    authBaseUrl: (env.NEXTAUTH_URL || env.BETTER_AUTH_URL)!,
    privateStorageRoot: env.PRIVATE_STORAGE_ROOT,
    paymentProvider: env.PAYMENT_PROVIDER,
    konnectEnvironment: env.KONNECT_ENV,
    konnectApiKey: env.KONNECT_API_KEY,
    konnectReceiverWalletId: env.KONNECT_RECEIVER_WALLET_ID,
    konnectPaymentLifespanMinutes: env.KONNECT_PAYMENT_LIFESPAN_MINUTES,
    emailApiUrl: env.EMAIL_API_URL,
    jobsSecret: env.JOBS_SECRET,
    malwareScannerUrl: env.MALWARE_SCANNER_URL,
  };
}

export function formatEnvError(error: unknown): string {
  if (!(error instanceof z.ZodError)) return error instanceof Error ? error.message : String(error);
  return error.issues.map((issue) => `- ${issue.path.join(".") || "environment"}: ${issue.message}`).join("\n");
}
