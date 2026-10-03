/**
 * Teste l'intégration Konnect de bout en bout contre un FAUX serveur Konnect local (aucune clé
 * réelle) : montants, rejouage du webhook, concurrence, expiration, paiement tardif, panne du
 * prestataire. Lance lui-même `next dev` sur le port 3002 avec PAYMENT_PROVIDER=konnect.
 *
 * Prérequis : MySQL + base seedée, aucun autre `next dev` actif dans ce dossier (verrou Next).
 * Usage : npx tsx scripts/e2e-payments.ts
 */
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { PrismaClient } from "@prisma/client";

const PORT = 3002;
const B = `http://localhost:${PORT}`;
const prisma = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`);
}

// ---------------------------------------------------------------- faux Konnect
interface FakePayment { status: string; reachedAmount: number; token: string; orderId: string; amount: number }
const fake = new Map<string, FakePayment>();
const initRequests: Array<{ headers: IncomingMessage["headers"]; body: Record<string, unknown> }> = [];
let failInit = false;
let failDetails = false;
let counter = 0;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => { let data = ""; req.on("data", (chunk) => (data += chunk)); req.on("end", () => resolve(data)); });
}
const konnect = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const send = (status: number, body: unknown) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
  if (req.headers["x-api-key"] !== "test-key") return send(401, { message: "bad key" });
  if (req.method === "POST" && req.url === "/payments/init-payment") {
    const body = JSON.parse(await readBody(req));
    initRequests.push({ headers: req.headers, body });
    if (failInit) return send(500, { message: "boom" });
    const ref = `pay${String(++counter).padStart(6, "0")}abcdef`;
    fake.set(ref, { status: "pending", reachedAmount: 0, token: body.token, orderId: body.orderId, amount: body.amount });
    return send(200, { payUrl: `https://pay.example.test/checkout/${ref}`, paymentRef: ref });
  }
  const match = req.url?.match(/^\/payments\/([\w-]+)$/);
  if (req.method === "GET" && match) {
    if (failDetails) return send(503, { message: "down" });
    const payment = fake.get(match[1]);
    if (!payment) return send(404, { message: "unknown" });
    return send(200, { payment: { id: match[1], status: payment.status, reachedAmount: payment.reachedAmount, token: payment.token, orderId: payment.orderId, transactions: payment.status === "completed" ? [{ status: "success" }] : [] } });
  }
  send(404, {});
});
const complete = (ref: string, patch: Partial<FakePayment> = {}) => {
  const payment = fake.get(ref)!;
  Object.assign(payment, { status: "completed", reachedAmount: payment.amount }, patch);
};

// ---------------------------------------------------------------- client HTTP
class Client {
  jar = new Map<string, string>();
  // Chaque client simule sa propre adresse IP : les limites par IP restent actives sans que les
  // exécutions successives des tests se partagent (et épuisent) le même compteur.
  readonly ip = `10.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
  async req(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers: Record<string, string> = { Origin: B, "x-forwarded-for": this.ip, ...(init.headers as Record<string, string>) };
    if (this.jar.size) headers.cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    let body = init.body;
    if (init.json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(init.json); }
    const res = await fetch(B + path, { ...init, headers, body, redirect: "manual" });
    for (const c of res.headers.getSetCookie()) { const [kv] = c.split(";"); const i = kv.indexOf("="); this.jar.set(kv.slice(0, i), kv.slice(i + 1)); }
    return res;
  }
}
const pdf = () => {
  const objs = ["<</Type/Catalog/Pages 2 0 R>>", "<</Type/Pages/Kids[3 0 R]/Count 1>>", "<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]/Contents 4 0 R>>", "<</Length 0>>\nstream\n\nendstream"];
  let s = "%PDF-1.4\n"; const off: number[] = [];
  objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") + `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${x}\n%%` + "EOF";
  return Buffer.from(s);
};

// ---------------------------------------------------------------- serveur Next
let server: ChildProcess | null = null;
async function startServer(konnectPort: number) {
  server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
    shell: true,
    env: {
      ...process.env,
      PAYMENT_PROVIDER: "konnect",
      KONNECT_ENV: "sandbox",
      KONNECT_API_BASE_URL: `http://127.0.0.1:${konnectPort}`,
      KONNECT_API_KEY: "test-key",
      KONNECT_RECEIVER_WALLET_ID: "wallet-test",
      KONNECT_PAYMENT_LIFESPAN_MINUTES: "30",
      NEXTAUTH_URL: B,
      BETTER_AUTH_URL: B,
    },
    stdio: "ignore",
  });
  for (let i = 0; i < 90; i++) {
    try { if ((await fetch(`${B}/api/health/live`)).ok) return; } catch { /* démarrage */ }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Le serveur de test n'a pas démarré.");
}
function stopServer() {
  if (!server?.pid) return;
  try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" }); } catch { /* déjà arrêté */ }
}

// ---------------------------------------------------------------- scénarios
async function newOrder(client: Client, serviceId: string): Promise<string> {
  const f = new FormData();
  for (const [k, v] of Object.entries({ serviceId, sourceLang: "ar", targetLang: "fr", pages: "2", delayKey: "delay.standard", destinationCountry: "France", receivingAuthority: "", purpose: "Test paiement", certificationNeeds: "CERTIFIED", deliveryMethod: "DIGITAL", deliveryAddress: "", clientNotes: "" })) f.set(k, v);
  f.set("file", new File([new Uint8Array(pdf())], "acte.pdf", { type: "application/pdf" }));
  const created = await (await client.req("/api/orders", { method: "POST", body: f })).json();
  if (!created.id) throw new Error(`commande non créée: ${JSON.stringify(created)}`);
  await client.req(`/api/orders/${created.id}/accept-quote`, { method: "POST" });
  return created.id as string;
}
const refOf = (url: string) => url.split("/").pop()!;
const webhook = (ref: string) => fetch(`${B}/api/payments/webhook?payment_ref=${ref}`);

async function main() {
  await new Promise<void>((resolve) => konnect.listen(0, "127.0.0.1", resolve));
  const konnectPort = (konnect.address() as { port: number }).port;
  await startServer(konnectPort);

  const stamp = Date.now();
  const client = new Client();
  const reg = await client.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Pay Test", email: `pay.${stamp}@test.local`, password: "Passw0rd!Long", firstName: "Pay", lastName: "Test", termsAccepted: true } });
  check("client registered", reg.status === 200, String(reg.status));
  const service = await prisma.service.findFirstOrThrow({ where: { active: true, pricePerPage: { gt: 0 } } });

  // 1) initialisation
  const order1 = await newOrder(client, service.id);
  const o1 = await prisma.order.findUniqueOrThrow({ where: { id: order1 } });
  let r = await client.req(`/api/orders/${order1}/payment/advance`, { method: "POST" });
  const start1 = await r.json();
  check("advance payment starts via Konnect (200, https checkout URL)", r.status === 200 && /^https:\/\/pay\.example\.test\/checkout\/pay\d+/.test(start1.redirectUrl ?? ""), `${r.status} ${JSON.stringify(start1)}`);
  const init1 = initRequests.at(-1)!;
  check("API key sent to Konnect", init1.headers["x-api-key"] === "test-key");
  check("amount sent in millimes (advance x 1000)", init1.body.amount === o1.advanceAmount.mul(1000).toNumber(), `${init1.body.amount} vs ${o1.advanceAmount.mul(1000)}`);
  check("currency TND, immediate payment", init1.body.token === "TND" && init1.body.type === "immediate");
  check("orderId carries order + phase", init1.body.orderId === `${order1}:ADVANCE`);
  check("webhook URL points to our site", init1.body.webhook === `${B}/api/payments/webhook`);
  const ref1 = refOf(start1.redirectUrl);
  const payment1 = await prisma.payment.findUniqueOrThrow({ where: { providerRef: ref1 } });
  check("payment row PENDING with active lock + checkout URL", payment1.status === "PENDING" && payment1.activeKey === `${order1}:ADVANCE:konnect` && payment1.checkoutUrl === start1.redirectUrl);

  // 2) réutilisation + concurrence
  const initsBefore = initRequests.length;
  r = await client.req(`/api/orders/${order1}/payment/advance`, { method: "POST" });
  check("second click reuses the pending checkout (no new Konnect session)", (await r.json()).redirectUrl === start1.redirectUrl && initRequests.length === initsBefore);
  const order2 = await newOrder(client, service.id);
  const burst = await Promise.all(Array.from({ length: 6 }, () => client.req(`/api/orders/${order2}/payment/advance`, { method: "POST" }).then((x) => x.json())));
  const activeRows = await prisma.payment.count({ where: { orderId: order2, status: "PENDING" } });
  check("6 concurrent clicks leave exactly ONE active payment", activeRows === 1, `${activeRows}`);
  check("all concurrent clicks get the same checkout URL", new Set(burst.map((b) => b.redirectUrl)).size === 1, JSON.stringify(burst.map((b) => b.redirectUrl)));

  // 3) webhook : en attente, valeurs incohérentes, succès, rejouage
  r = await webhook(ref1);
  check("webhook while Konnect says pending -> 202, order untouched", r.status === 202 && (await prisma.order.findUniqueOrThrow({ where: { id: order1 } })).status === "EN_ATTENTE_ACOMPTE");
  complete(ref1, { reachedAmount: payment1.amount.mul(1000).toNumber() - 1 });
  r = await webhook(ref1);
  check("underpayment rejected (409)", r.status === 409, String(r.status));
  complete(ref1, { token: "EUR" });
  check("wrong currency rejected (409)", (await webhook(ref1)).status === 409);
  complete(ref1, { orderId: `${order2}:ADVANCE` });
  check("payment for another order rejected (409)", (await webhook(ref1)).status === 409);
  check("none of the invalid completions advanced the order", (await prisma.order.findUniqueOrThrow({ where: { id: order1 } })).status === "EN_ATTENTE_ACOMPTE");
  complete(ref1, { orderId: `${order1}:ADVANCE`, token: "TND" });
  r = await webhook(ref1);
  const ok1 = await r.json();
  const after1 = await prisma.order.findUniqueOrThrow({ where: { id: order1 } });
  check("valid completion confirms the advance", r.status === 200 && ok1.alreadyProcessed === false && after1.status === "ACOMPTE_PAYE" && after1.advancePaid);
  const confirmed1 = await prisma.payment.findUniqueOrThrow({ where: { providerRef: ref1 } });
  check("payment SUCCEEDED, active lock released", confirmed1.status === "SUCCEEDED" && confirmed1.activeKey === null);
  const mails = () => prisma.emailOutbox.count({ where: { template: "PAYMENT_CONFIRMED", recipient: `pay.${stamp}@test.local` } });
  const mailsAfterFirst = await mails();
  for (let i = 0; i < 3; i++) await webhook(ref1);
  r = await webhook(ref1);
  check("replayed webhook is harmless (alreadyProcessed)", r.status === 200 && (await r.json()).alreadyProcessed === true);
  check("replays do not duplicate history or e-mails", (await prisma.orderStatusHistory.count({ where: { orderId: order1, status: "ACOMPTE_PAYE" } })) === 1 && (await mails()) === mailsAfterFirst && mailsAfterFirst === 1, `${mailsAfterFirst}`);
  check("unknown payment_ref -> 404", (await webhook("doesnotexist12345")).status === 404);
  check("missing payment_ref -> 400", (await fetch(`${B}/api/payments/webhook`)).status === 400);
  check("POST webhook refused (405)", (await fetch(`${B}/api/payments/webhook`, { method: "POST", body: "{}" })).status === 405);
  check("mock confirmation route hidden under Konnect (404)", (await client.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: ref1 } })).status === 404);
  r = await client.req(`/api/orders/${order1}/payment/advance`, { method: "POST" });
  check("cannot pay the advance twice (409)", r.status === 409);

  // 4) expiration : nouvelle tentative possible, paiement tardif accepté
  const order3 = await newOrder(client, service.id);
  const first = await (await client.req(`/api/orders/${order3}/payment/advance`, { method: "POST" })).json();
  const refOld = refOf(first.redirectUrl);
  await prisma.payment.update({ where: { providerRef: refOld }, data: { createdAt: new Date(Date.now() - 40 * 60_000) } });
  r = await client.req(`/api/orders/${order3}/payment/advance`, { method: "POST" });
  const second = await r.json();
  check("after expiry a NEW checkout is created (client not stuck)", r.status === 200 && second.redirectUrl !== first.redirectUrl, `${r.status} ${JSON.stringify(second)}`);
  const oldRow = await prisma.payment.findUniqueOrThrow({ where: { providerRef: refOld } });
  check("expired attempt retired (FAILED, lock released)", oldRow.status === "FAILED" && oldRow.activeKey === null);
  complete(refOld);
  r = await webhook(refOld);
  check("late payment on the retired attempt is still honoured", r.status === 200 && (await prisma.order.findUniqueOrThrow({ where: { id: order3 } })).status === "ACOMPTE_PAYE", String(r.status));
  complete(refOf(second.redirectUrl));
  r = await webhook(refOf(second.redirectUrl));
  check("a second payment for the same phase never advances the order twice", r.status === 409 && (await prisma.orderStatusHistory.count({ where: { orderId: order3, status: "ACOMPTE_PAYE" } })) === 1, String(r.status));

  // 5) réconciliation au démarrage : le client a payé mais le webhook n'est jamais arrivé
  const order4 = await newOrder(client, service.id);
  const lost = refOf((await (await client.req(`/api/orders/${order4}/payment/advance`, { method: "POST" })).json()).redirectUrl);
  await prisma.payment.update({ where: { providerRef: lost }, data: { createdAt: new Date(Date.now() - 40 * 60_000) } });
  complete(lost);
  r = await client.req(`/api/orders/${order4}/payment/advance`, { method: "POST" });
  check("expired attempt that was actually paid is reconciled (409 already confirmed)", r.status === 409 && (await r.json()).code === "PAYMENT_ALREADY_CONFIRMED", String(r.status));
  check("...and the order is now paid", (await prisma.order.findUniqueOrThrow({ where: { id: order4 } })).status === "ACOMPTE_PAYE");

  // 6) pannes du prestataire
  const order5 = await newOrder(client, service.id);
  const stuck = refOf((await (await client.req(`/api/orders/${order5}/payment/advance`, { method: "POST" })).json()).redirectUrl);
  await prisma.payment.update({ where: { providerRef: stuck }, data: { createdAt: new Date(Date.now() - 40 * 60_000) } });
  failDetails = true;
  r = await client.req(`/api/orders/${order5}/payment/advance`, { method: "POST" });
  check("provider down while checking an expired attempt -> 502, nothing retired", r.status === 502 && (await prisma.payment.findUniqueOrThrow({ where: { providerRef: stuck } })).status === "PENDING", String(r.status));
  failDetails = false;
  const order6 = await newOrder(client, service.id);
  failInit = true;
  r = await client.req(`/api/orders/${order6}/payment/advance`, { method: "POST" });
  check("Konnect init failure -> 502, no payment row left", r.status === 502 && (await prisma.payment.count({ where: { orderId: order6 } })) === 0, String(r.status));
  failInit = false;
  r = await client.req(`/api/orders/${order6}/payment/advance`, { method: "POST" });
  check("recovers once Konnect is back", r.status === 200);

  // 7) autres
  check("another client cannot start my payment (403)", await (async () => {
    const other = new Client();
    await other.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Other", email: `pay.other.${stamp}@test.local`, password: "Passw0rd!Long", firstName: "O", lastName: "T", termsAccepted: true } });
    return (await other.req(`/api/orders/${order6}/payment/advance`, { method: "POST" })).status === 403;
  })());

  console.log(`\n${pass} passed, ${fail} failed`);
}

main()
  .catch((error) => { console.error("ERROR", error); fail++; })
  .finally(async () => { stopServer(); konnect.close(); await prisma.$disconnect(); process.exit(fail ? 1 : 0); });
