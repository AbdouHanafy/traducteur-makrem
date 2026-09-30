import type { NextConfig } from "next";

/**
 * Security headers de base (ARCHITECTURE.md §12 / brief §26). CSP limitée aux directives qui
 * ne cassent pas Next.js (pas de script-src strict pour l'instant) — à resserrer Phase par phase
 * à mesure que des dépendances externes (paiement, fonts, etc.) sont introduites.
 * Le provider de paiement branché en Phase 11 exigera d'ajouter son domaine à connect-src/
 * frame-src ici plutôt que d'assouplir globalement la policy.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Rendu des aperçus filigranés (§8 workflow commande) : binaires natifs / gros bundles ESM
  // que le bundler ne doit pas essayer de retraiter côté serveur.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
