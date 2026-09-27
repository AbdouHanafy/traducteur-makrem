import { hash, verify } from "@node-rs/argon2";

// `Algorithm` est un `const enum` (voir @node-rs/argon2), inutilisable avec les modules
// isolés de Next.js/SWC — on reprend directement sa valeur numérique (Argon2id = 2).
const ARGON2ID = 2;

/**
 * Hachage de mot de passe — argon2id (ARCHITECTURE.md §2), jamais bcrypt/sha.
 * @node-rs/argon2 fournit des binaires précompilés (pas de node-gyp requis sur Windows,
 * contrairement au paquet `argon2` historique).
 */
export function hashPassword(password: string): Promise<string> {
  return hash(password, { algorithm: ARGON2ID });
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}
