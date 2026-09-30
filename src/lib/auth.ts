import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { checkRateLimit, MINUTE } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

/**
 * Better Auth (ARCHITECTURE.md §2, remplace NextAuth v5) — Credentials email/mot de passe,
 * hachage argon2id maison (src/lib/password.ts) plutôt que le scrypt par défaut.
 *
 * `role` est déclaré avec `input: false` : un payload de /sign-up/email ne peut jamais fixer
 * son propre rôle, seule la valeur par défaut ("CLIENT" côté Prisma) s'applique à l'inscription
 * publique — voir ARCHITECTURE.md §7 (RBAC).
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  baseURL: process.env.NEXTAUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 72,
    password: {
      hash: (password) => hashPassword(password),
      verify: ({ hash, password }) => verifyPassword(hash, password),
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
