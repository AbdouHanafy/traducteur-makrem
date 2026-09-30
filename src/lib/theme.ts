/**
 * Couleurs de marque pilotables depuis le backoffice. Les valeurs par défaut sont celles de
 * globals.css (identité "cabinet juridique premium") : la base ne stocke que les surcharges.
 */
export interface ThemeToken {
  key: string;
  cssVar: string;
  label: string;
  hint: string;
  default: string;
}

export const THEME_TOKENS: ThemeToken[] = [
  { key: "navy", cssVar: "--color-navy", label: "Bleu nuit", hint: "Titres, fonds sombres, barre latérale", default: "#14284d" },
  { key: "navy-2", cssVar: "--color-navy-2", label: "Bleu nuit (foncé)", hint: "Dégradés et pied de page", default: "#0c1a34" },
  { key: "blue", cssVar: "--color-blue", label: "Couleur principale", hint: "Boutons, liens, accents", default: "#2456b8" },
  { key: "blue-2", cssVar: "--color-blue-2", label: "Couleur principale (survol)", hint: "Survol des boutons et liens", default: "#1e4fa8" },
  { key: "blue-soft", cssVar: "--color-blue-soft", label: "Fond d'accent doux", hint: "Pastilles, badges, zones mises en avant", default: "#e9effa" },
  { key: "mist", cssVar: "--color-mist", label: "Fond de page", hint: "Arrière-plan général du site", default: "#edf0f5" },
  { key: "paper", cssVar: "--color-paper", label: "Fond des cartes", hint: "Cartes et panneaux blancs", default: "#ffffff" },
  { key: "ink", cssVar: "--color-ink", label: "Texte principal", hint: "Corps de texte", default: "#14203a" },
  { key: "muted", cssVar: "--color-muted", label: "Texte secondaire", hint: "Descriptions et légendes", default: "#5b6a83" },
  { key: "line", cssVar: "--color-line", label: "Bordures", hint: "Filets et contours", default: "#dce3ee" },
  { key: "seal", cssVar: "--color-seal", label: "Couleur du sceau", hint: "Cachet et détails dorés", default: "#b4894e" },
  { key: "ok", cssVar: "--color-ok", label: "Succès", hint: "Paiement confirmé, fichier disponible", default: "#1e9e6a" },
  { key: "ok-soft", cssVar: "--color-ok-soft", label: "Succès (fond doux)", hint: "Fonds des messages de succès", default: "#e3f5ec" },
  { key: "warn", cssVar: "--color-warn", label: "Attention", hint: "Avertissements", default: "#c9822b" },
];

export const THEME_SETTING_PREFIX = "theme.";
export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Convertit les surcharges enregistrées en variables CSS (valeurs strictement validées). */
export function themeToCssVars(overrides: Record<string, string>): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const token of THEME_TOKENS) {
    const value = overrides[token.key];
    if (value && HEX_COLOR.test(value)) vars[token.cssVar] = value.toLowerCase();
  }
  return vars;
}
