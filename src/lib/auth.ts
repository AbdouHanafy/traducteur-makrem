import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { checkRateLimit, MINUTE } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { enqueueEmail } from "@/lib/email/outbox";

/**
 * Better Auth (ARCHITECTURE.md §2, remplace NextAuth v5) — Credentials email/mot de passe,
 * hachage argon2id maison (src/lib/password.ts) plutôt que le scrypt par défaut.
 *
 * `role` est déclaré avec `input: false` : un payload de /sign-up/email ne peut jamais fixer
 * son propre rôle, seule la valeur par défaut ("CLIENT" côté Prisma) s'applique à l'inscription
 * publique — voir ARCHITECTURE.md §7 (RBAC).
 */
const authSecret = process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET;

// Sans secret, Better Auth retombe sur une valeur par défaut PUBLIQUE : n'importe qui pourrait forger
// un cookie de session. En production on refuse de démarrer (sauf pendant `next build`, qui n'a pas
// accès aux secrets de l'environnement d'exécution).
if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build" && (!authSecret || authSecret.length < 32)) {
  throw new Error("AUTH_SECRET manquant ou trop court (32 caractères minimum). Générez-en un : openssl rand -base64 32");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  baseURL: process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: authSecret,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    minPasswordLength: 10,
    maxPasswordLength: 72,
    password: {
      hash: (password) => hashPassword(password),
      verify: ({ hash, password }) => verifyPassword(hash, password),
    },
    sendResetPassword: async ({ user, url }) => {
      await enqueueEmail(prisma, {
        recipient: user.email,
        template: "RESET_PASSWORD",
        payload: { name: user.name, url },
      });
    },
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendOnSignUp: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await enqueueEmail(prisma, {
        recipient: user.email,
        template: "VERIFY_EMAIL",
        payload: { name: user.name, url },
      });
    },
  },
  // Actif aussi en développement (par défaut Better Auth ne limite qu'en production).
  // Stockage mémoire : suffisant pour une instance ; passer à "database" si plusieurs instances.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 10 * 60, max: 10 },
      "/change-password": { window: 10 * 60, max: 10 },
      "/request-password-reset": { window: 10 * 60, max: 5 },
      "/reset-password": { window: 10 * 60, max: 10 },
      "/send-verification-email": { window: 10 * 60, max: 5 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const body = (ctx.body ?? {}) as Record<string, unknown>;

      if (ctx.path === "/sign-in/email" && typeof body.email === "string") {
        // Freine le bourrage d'identifiants : plafond par adresse email, quelle que soit l'IP.
        const attempt = checkRateLimit(`login:${body.email.trim().toLowerCase()}`, 15, 15 * MINUTE);
        if (!attempt.ok) throw new APIError("TOO_MANY_REQUESTS", { message: "Trop de tentatives. Réessayez plus tard." });
      }

      if (ctx.path === "/sign-up/email") {
        // Champ piège invisible pour les humains : un robot qui le remplit est rejeté.
        if (typeof body.website === "string" && body.website.trim() !== "") {
          throw new APIError("BAD_REQUEST", { message: "Requête invalide." });
        }
        if (body.termsAccepted !== true) {
          throw new APIError("BAD_REQUEST", { message: "CONSENT_REQUIRED", code: "CONSENT_REQUIRED" });
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        // Horodate le consentement (l'endpoint d'inscription l'a exigé juste avant).
        before: async (user) => ({ data: { ...user, termsAcceptedAt: new Date() } }),
      },
    },
  },
  user: {
    additionalFields: {
      termsAcceptedAt: {
        type: "date",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "CLIENT",
      },
      firstName: {
        type: "string",
        required: true,
        input: true,
      },
      lastName: {
        type: "string",
        required: true,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
