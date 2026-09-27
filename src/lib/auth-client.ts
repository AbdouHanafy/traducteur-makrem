import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

/**
 * Client Better Auth — pas de Provider React requis (contrairement à NextAuth) :
 * `useSession`/`signIn`/`signUp`/`signOut` s'utilisent directement depuis ce module.
 * `inferAdditionalFields` type le client sur nos champs custom (role/firstName/lastName/phone).
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
