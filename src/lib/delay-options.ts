/** Délais proposés à la commande — module sans dépendance serveur, importable côté client. */
export const DELAY_OPTIONS = [
  { key: "delay.standard", label: "Standard (5-7 jours)" },
  { key: "delay.express", label: "Express (48h)" },
  { key: "delay.urgent", label: "Urgent (24h)" },
] as const;

export type DelayKey = (typeof DELAY_OPTIONS)[number]["key"];
