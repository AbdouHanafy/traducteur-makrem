import { NextResponse } from "next/server";

/**
 * Limiteur de débit en mémoire (fenêtre fixe). Suffisant pour une instance unique ; avec
 * plusieurs instances, chaque processus compte séparément (utiliser Redis/DB dans ce cas).
 * Le magasin vit sur `globalThis` pour survivre au rechargement à chaud en développement.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const globalStore = globalThis as unknown as { __rateLimitStore?: Map<string, Bucket> };
const store = (globalStore.__rateLimitStore ??= new Map<string, Bucket>());

const PRUNE_THRESHOLD = 5000;

function prune(now: number) {
  if (store.size < PRUNE_THRESHOLD) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Secondes avant de pouvoir réessayer (0 si autorisé). */
  retryAfter: number;
}

/** Compte un appel pour `key` ; refuse dès que `limit` est dépassé dans la fenêtre. */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Adresse IP du client. Le reverse proxy (nginx, plateforme d'hébergement) doit ÉCRASER
 * `x-forwarded-for` : sinon un client pourrait le forger pour contourner les limites par IP.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: "Trop de tentatives. Réessayez plus tard.", code: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

/**
 * Applique un ou plusieurs plafonds ; renvoie une réponse 429 si l'un d'eux est dépassé,
 * `null` sinon. Ex. : `const blocked = limit(request, "orders", { user: id, perUser: [15, HOUR] })`.
 */
export function limit(
  request: Request,
  name: string,
  options: { userId?: string; perUser?: [number, number]; perIp?: [number, number] },
): NextResponse | null {
  if (options.perIp) {
    const result = checkRateLimit(`ip:${name}:${getClientIp(request)}`, options.perIp[0], options.perIp[1]);
    if (!result.ok) return tooManyRequests(result.retryAfter);
  }
  if (options.perUser && options.userId) {
    const result = checkRateLimit(`user:${name}:${options.userId}`, options.perUser[0], options.perUser[1]);
    if (!result.ok) return tooManyRequests(result.retryAfter);
  }
  return null;
}

/**
 * Refuse une requête dont le `Content-Length` annonce un corps trop gros AVANT de le lire
 * (`request.formData()` chargerait tout en mémoire). `overheadBytes` couvre l'enveloppe multipart.
 */
export function rejectOversize(request: Request, maxFileBytes: number, overheadBytes = 1024 * 1024) {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxFileBytes + overheadBytes) {
    return NextResponse.json({ error: "Fichier trop volumineux.", code: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }
  return null;
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
