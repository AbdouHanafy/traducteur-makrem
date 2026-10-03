import "server-only";

/**
 * Politique de sécurité des comptes administrateur : la double authentification (TOTP) est exigée
 * dès que REQUIRE_ADMIN_2FA vaut "true" (obligatoire en production, voir src/lib/env-schema.ts).
 * Désactivée par défaut en développement pour ne pas bloquer le travail local.
 */
export function isAdminTwoFactorRequired(): boolean {
  return process.env.REQUIRE_ADMIN_2FA === "true";
}

interface SessionUserLike {
  role?: string | null;
  twoFactorEnabled?: boolean | null;
}

/** Un administrateur sans 2FA ne doit accéder ni aux écrans ni aux API du back-office. */
export function adminNeedsTwoFactorSetup(user: SessionUserLike): boolean {
  return user.role === "ADMIN" && isAdminTwoFactorRequired() && user.twoFactorEnabled !== true;
}
