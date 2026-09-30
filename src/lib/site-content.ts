import { DICTIONARIES, LOCALES, type Locale } from "@/lib/i18n";

export interface SiteContentGroup {
  id: string;
  label: string;
  description: string;
  prefixes: string[];
}

export const SITE_CONTENT_GROUPS: SiteContentGroup[] = [
  { id: "identity", label: "Identité & coordonnées", description: "Nom du cabinet, téléphones, email et adresse.", prefixes: ["brand.", "contact."] },
  { id: "navigation", label: "Navigation", description: "Menu principal, langues et libellés communs.", prefixes: ["nav.", "language.", "common."] },
  { id: "home", label: "Page d'accueil", description: "Hero, partenaires, chiffres, services, parcours, citation, avis et appel à l'action.", prefixes: ["hero.", "partners.", "stats.", "home.", "workflow.", "statement.", "testimonials.", "cta."] },
  { id: "pages", label: "Pages publiques", description: "À propos, services, contact, FAQ et articles.", prefixes: ["page.", "services.", "service.", "seo."] },
  { id: "order", label: "Commande en ligne", description: "Formulaire de devis, fichiers, délais et messages de confiance.", prefixes: ["order.", "file.", "delay."] },
  { id: "client", label: "Espace client", description: "Tableau de bord, commandes, documents, compte et paiement.", prefixes: ["app."] },
  { id: "access", label: "Connexion & inscription", description: "Textes des pages d'accès à l'espace client.", prefixes: ["auth.", "login.", "register."] },
  { id: "footer", label: "Pied de page", description: "Arguments de confiance, colonnes et mentions de bas de page.", prefixes: ["footer."] },
];

export const SITE_CONTENT_KEYS = Array.from(new Set(
  SITE_CONTENT_GROUPS.flatMap((group) =>
    Object.keys(DICTIONARIES.fr).filter((key) => group.prefixes.some((prefix) => key.startsWith(prefix))),
  ),
));

export const SITE_CONTENT_KEY_SET = new Set(SITE_CONTENT_KEYS);

export function getDefaultSiteContent(locale: Locale): Record<string, string> {
  return Object.fromEntries(SITE_CONTENT_KEYS.map((key) => [key, DICTIONARIES[locale][key] ?? DICTIONARIES.fr[key] ?? key]));
}

export function getSiteContentAdminData() {
  return {
    groups: SITE_CONTENT_GROUPS.map((group) => ({
      ...group,
      keys: SITE_CONTENT_KEYS.filter((key) => group.prefixes.some((prefix) => key.startsWith(prefix))),
    })),
    defaults: Object.fromEntries(LOCALES.map((locale) => [locale, getDefaultSiteContent(locale)])) as Record<Locale, Record<string, string>>,
  };
}
