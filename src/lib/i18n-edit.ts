/**
 * Éditeur visuel : en mode édition (aperçu dans le backoffice uniquement), chaque texte traduit
 * reçoit à sa fin une signature INVISIBLE contenant sa clé. Le script de l'aperçu retrouve ainsi,
 * pour n'importe quel texte cliqué, la clé du dictionnaire à modifier — sans toucher aux composants.
 *
 * Encodage : START (U+2063) + bits de chaque caractère de la clé (U+200B = 0, U+200C = 1) + END (U+2064).
 */
const START = "⁣";
const END = "⁤";
const ZERO = "​";
const ONE = "‌";

export const MARKER_PATTERN = /⁣([​‌]+)⁤/g;

/** Les valeurs qui servent d'adresse (logo, image) ne doivent pas être polluées par la signature. */
export function isMarkable(key: string, value: string): boolean {
  return value.length > 0 && !/Url$/.test(key) && /^[\w.-]+$/.test(key);
}

export function encodeKey(key: string): string {
  let bits = "";
  for (const char of key) bits += char.charCodeAt(0).toString(2).padStart(8, "0");
  return START + bits.replaceAll("0", ZERO).replaceAll("1", ONE) + END;
}

export function decodeBits(bits: string): string {
  const normalized = bits.replaceAll(ZERO, "0").replaceAll(ONE, "1");
  let key = "";
  for (let i = 0; i + 8 <= normalized.length; i += 8) key += String.fromCharCode(parseInt(normalized.slice(i, i + 8), 2));
  return key;
}

/** Toutes les signatures d'un texte, avec leur position (pour choisir la plus proche d'un clic). */
export function findMarkers(text: string): Array<{ key: string; index: number }> {
  const result: Array<{ key: string; index: number }> = [];
  for (const match of text.matchAll(MARKER_PATTERN)) result.push({ key: decodeBits(match[1]), index: match.index ?? 0 });
  return result;
}

/** Texte sans signature (pour l'afficher ou le comparer). */
export function stripMarkers(text: string): string {
  return text.replace(MARKER_PATTERN, "");
}

/** Paramètre d'URL qui active le mode édition dans l'aperçu. */
export const EDIT_QUERY_PARAM = "__edit";
/** Type du message envoyé de l'aperçu vers le backoffice quand un texte est cliqué. */
export const EDIT_MESSAGE_TYPE = "site-editor:select-key";
