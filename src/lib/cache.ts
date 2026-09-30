import { revalidatePath } from "next/cache";

/**
 * Le site public est rendu statiquement (une page par langue, voir app/(site)/[locale]) : toute
 * modification faite depuis le backoffice doit invalider ces pages pour qu'elles se régénèrent à
 * la prochaine visite.
 *
 * Le nom du groupe de routes `(site)` fait partie des tags de cache Next.js : `/[locale]` seul
 * ne correspondrait à rien et l'invalidation serait silencieusement sans effet.
 */
export function revalidateSite() {
  revalidatePath("/(site)/[locale]", "layout");
}
