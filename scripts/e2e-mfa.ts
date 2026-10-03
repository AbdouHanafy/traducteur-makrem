/**
 * Teste la double authentification des administrateurs de bout en bout (TOTP réel, codes de secours,
 * verrouillage, application de la politique sur les pages ET les API). Utilise un administrateur
 * jetable : les comptes de démonstration ne sont jamais modifiés. Lance son propre `next dev`
 * (port 3003) avec REQUIRE_ADMIN_2FA=true.
 *
 * Prérequis : MySQL + base seedée, aucun autre `next dev` actif dans ce dossier (verrou Next).
 * Usage : npx tsx scripts/e2e-mfa.ts
 */
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { totp } from "./totp";

const PORT = 3003;
const B = `http://localhost:${PORT}`;
const prisma = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`);
}

// ---------------------------------------------------------------- client HTTP
class Client {
  jar = new Map<string, string>();
  readonly ip = `10.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
  async req(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers: Record<string, string> = { Origin: B, "x-forwarded-for": this.ip, ...(init.headers as Record<string, string>) };
    if (this.jar.size) headers.cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    let body = init.body;
    if (init.json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(init.json); }
    const res = await fetch(B + path, { ...init, headers, body, redirect: "manual" });
    for (const c of res.headers.getSetCookie()) {
      const [kv] = c.split(";");
      const i = kv.indexOf("=");
      const value = kv.slice(i + 1);
      if (value === "" || /expires=Thu, 01 Jan 1970/i.test(c)) this.jar.delete(kv.slice(0, i)); else this.jar.set(kv.slice(0, i), value);
    }
    return res;
  }
  signIn = (email: string, password: string) => this.req("/api/auth/sign-in/email", { method: "POST", json: { email, password } });
}

// ---------------------------------------------------------------- serveur Next
let server: ChildProcess | null = null;
async function startServer() {
  server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
    shell: true,
    detached: process.platform !== "win32",
    env: { ...process.env, REQUIRE_ADMIN_2FA: "true", NEXTAUTH_URL: B, BETTER_AUTH_URL: B },
    stdio: process.env.E2E_SERVER_LOGS ? "inherit" : "ignore", // E2E_SERVER_LOGS=1 pour voir les journaux du serveur
  });
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(`${B}/api/health/live`)).ok) return; } catch { /* démarrage */ }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Le serveur de test n'a pas démarré.");
}
function stopServer() {
  if (!server?.pid) return;
  try {
    if (process.platform === "win32") execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
    else process.kill(-server.pid, "SIGTERM");
  } catch { /* déjà arrêté */ }
}

async function main() {
  await startServer();
  const stamp = Date.now();
  const email = `mfa.admin.${stamp}@test.local`;
  const password = "Admin-Passw0rd!Long";

  // administrateur jetable (sans 2FA)
  const admin = await prisma.user.create({ data: { email, name: "MFA Admin", firstName: "MFA", lastName: "Admin", role: "ADMIN", emailVerified: true } });
  await prisma.account.create({ data: { userId: admin.id, accountId: admin.id, providerId: "credential", password: await hashPassword(password) } });

  try {
    // 1) Sans 2FA, la politique ferme les pages et les API du back-office
    const a = new Client();
    let res = await a.signIn(email, password);
    check("admin without 2FA can sign in (password only)", res.status === 200 && !(await res.json()).twoFactorRedirect);
    res = await a.req("/admin");
    check("admin page redirects to the mandatory 2FA setup", res.status === 307 && (res.headers.get("location") ?? "").includes("/security/setup"), `${res.status} ${res.headers.get("location")}`);
    res = await a.req("/security/setup?next=/admin");
    check("2FA setup page is reachable (no redirect loop)", res.status === 200, String(res.status));
    res = await a.req("/api/admin/theme", { method: "PUT", json: { values: {} } });
    check("admin API refuses a session without 2FA (403 two_factor_required)", res.status === 403 && (await res.json()).error === "two_factor_required", String(res.status));
    res = await a.req("/api/admin/site-content/entry", { method: "PATCH", json: { locale: "fr", key: "hero.description", value: null } });
    check("...including the visual editor API", res.status === 403);
    const anyDocument = await prisma.document.findFirst({ where: { kind: "SOURCE" } });
    if (anyDocument) {
      res = await a.req(`/api/orders/${anyDocument.orderId}/documents/${anyDocument.id}/download`);
      check("an admin without 2FA cannot download client documents (403)", res.status === 403, String(res.status));
    }
    const clientEmail = `mfa.client.${stamp}@test.local`;
    const client = new Client();
    await client.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Client MFA", email: clientEmail, password: "Client-Passw0rd!Long", firstName: "C", lastName: "M", termsAccepted: true } });
    check("clients are not forced into 2FA", (await client.req("/dashboard")).status === 200);

    // 2) Activation
    res = await a.req("/api/auth/two-factor/enable", { method: "POST", json: { password: "wrong-password-123" } });
    check("enabling 2FA requires the current password", res.status >= 400, String(res.status));
    res = await a.req("/api/auth/two-factor/enable", { method: "POST", json: { password } });
    const enable = await res.json();
    check("enable returns a TOTP secret and 10 backup codes", res.status === 200 && typeof enable.totpURI === "string" && enable.backupCodes?.length === 10, JSON.stringify(enable).slice(0, 120));
    const secret = new URL(enable.totpURI).searchParams.get("secret")!;
    check("TOTP URI names the issuer and uses the account e-mail", enable.totpURI.includes("issuer=") && decodeURIComponent(enable.totpURI).includes(email));
    check("2FA is not active until a code is verified", (await prisma.user.findUniqueOrThrow({ where: { id: admin.id } })).twoFactorEnabled !== true);
    check("...so the admin APIs stay closed", (await a.req("/api/admin/theme", { method: "PUT", json: { values: {} } })).status === 403);
    res = await a.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: "000000" } });
    check("a wrong code does not activate 2FA", res.status >= 400, String(res.status));
    res = await a.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: totp(secret) } });
    check("the correct code activates 2FA", res.status === 200, String(res.status));
    check("user flagged twoFactorEnabled in the database", (await prisma.user.findUniqueOrThrow({ where: { id: admin.id } })).twoFactorEnabled === true);
    res = await a.req("/api/admin/theme", { method: "PUT", json: { values: {} } });
    check("admin API opens once 2FA is active (200)", res.status === 200, String(res.status));
    check("admin page opens once 2FA is active", (await a.req("/admin")).status === 200);
    const stored = await prisma.twoFactor.findFirstOrThrow({ where: { userId: admin.id } });
    check("TOTP secret and backup codes are not stored in clear text", !stored.secret.includes(secret) && !enable.backupCodes.some((code: string) => stored.backupCodes.includes(code)));

    // 3) Connexion en deux étapes
    const b = new Client();
    res = await b.signIn(email, password);
    const step1 = await res.json();
    check("sign-in with password alone now asks for the second factor", res.status === 200 && step1.twoFactorRedirect === true, JSON.stringify(step1).slice(0, 100));
    check("...and no usable session exists yet", (await b.req("/api/admin/theme", { method: "PUT", json: { values: {} } })).status === 401);
    check("...nor access to the back-office pages", (await b.req("/admin")).status === 307 && ((await b.req("/admin")).headers.get("location") ?? "").includes("/login"));
    res = await b.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: "123456" === totp(secret) ? "654321" : "123456" } });
    check("wrong code at login is refused", res.status >= 400, String(res.status));
    res = await b.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: totp(secret) } });
    check("correct code completes the sign-in", res.status === 200, String(res.status));
    check("admin API works after the second factor", (await b.req("/api/admin/theme", { method: "PUT", json: { values: {} } })).status === 200);

    // 4) Codes de secours : valables une seule fois
    const backup = enable.backupCodes[0] as string;
    const c = new Client();
    await c.signIn(email, password);
    res = await c.req("/api/auth/two-factor/verify-backup-code", { method: "POST", json: { code: backup } });
    check("a backup code signs in", res.status === 200, String(res.status));
    const d = new Client();
    await d.signIn(email, password);
    res = await d.req("/api/auth/two-factor/verify-backup-code", { method: "POST", json: { code: backup } });
    check("the same backup code cannot be used twice", res.status >= 400, String(res.status));
    res = await d.req("/api/auth/two-factor/verify-backup-code", { method: "POST", json: { code: enable.backupCodes[1] } });
    check("another backup code still works", res.status === 200, String(res.status));

    // 5) Régénération et désactivation exigent le mot de passe
    res = await b.req("/api/auth/two-factor/generate-backup-codes", { method: "POST", json: { password: "nope-nope-nope" } });
    check("regenerating backup codes requires the password", res.status >= 400, String(res.status));
    res = await b.req("/api/auth/two-factor/generate-backup-codes", { method: "POST", json: { password } });
    const fresh = await res.json();
    check("new backup codes are issued", res.status === 200 && fresh.backupCodes?.length === 10);
    const e = new Client();
    await e.signIn(email, password);
    res = await e.req("/api/auth/two-factor/verify-backup-code", { method: "POST", json: { code: enable.backupCodes[2] } });
    check("old backup codes stop working after regeneration", res.status >= 400, String(res.status));

    // 6) Verrouillage après 5 codes faux
    const f = new Client();
    await f.signIn(email, password);
    let refused = 0;
    for (let i = 0; i < 6; i++) {
      const wrong = totp(secret, 600 + i * 30) === totp(secret) ? "111111" : "11111" + (i % 10);
      res = await f.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: wrong } });
      if (res.status >= 400) refused++;
    }
    check("repeated wrong codes are all refused", refused === 6, `${refused}/6`);
    res = await f.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: totp(secret) } });
    check("the account is locked: even the right code is refused", res.status >= 400, String(res.status));
    await prisma.twoFactor.updateMany({ where: { userId: admin.id }, data: { lockedUntil: null, failedVerificationCount: 0 } });

    // 7) Désactivation : le mot de passe est exigé ; l'accès admin se referme aussitôt
    res = await b.req("/api/auth/two-factor/disable", { method: "POST", json: { password: "nope-nope-nope" } });
    check("disabling 2FA requires the password", res.status >= 400, String(res.status));
    res = await b.req("/api/auth/two-factor/disable", { method: "POST", json: { password } });
    check("2FA can be disabled with the password", res.status === 200, String(res.status));
    check("...and the admin APIs close again (policy still applies)", (await b.req("/api/admin/theme", { method: "PUT", json: { values: {} } })).status === 403);

    // 8) Un client peut aussi activer la 2FA (facultatif)
    res = await client.req("/api/auth/two-factor/enable", { method: "POST", json: { password: "Client-Passw0rd!Long" } });
    check("a client can opt in to 2FA", res.status === 200);
    const clientSecret = new URL((await res.json()).totpURI).searchParams.get("secret")!;
    await client.req("/api/auth/two-factor/verify-totp", { method: "POST", json: { code: totp(clientSecret) } });
    const clientAgain = new Client();
    check("an opted-in client is asked for the code at login", (await (await clientAgain.signIn(clientEmail, "Client-Passw0rd!Long")).json()).twoFactorRedirect === true);
  } finally {
    await prisma.user.deleteMany({ where: { email: { in: [email, `mfa.client.${stamp}@test.local`] } } });
  }

  console.log(`\n${pass} passed, ${fail} failed`);
}

main()
  .catch((error) => { console.error("ERROR", error); fail++; })
  .finally(async () => { stopServer(); await prisma.$disconnect(); process.exit(fail ? 1 : 0); });
