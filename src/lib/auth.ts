import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
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
  user: {
    additionalFields: {
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
