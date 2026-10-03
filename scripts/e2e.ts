import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { pdfText } from "./pdf-fixtures";

loadEnvConfig(process.cwd());
const B = "http://localhost:3000";
const prisma = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`); }

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
  async login(email: string, password: string) {
    const r = await this.req("/api/auth/sign-in/email", { method: "POST", json: { email, password } });
    return r.status;
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
const form = (o: Record<string, string>, file?: { data: Buffer; name: string; type: string }) => {
  const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v);
  if (file) f.set("file", new File([new Uint8Array(file.data)], file.name, { type: file.type })); return f;
};

async function main() {
  const stamp = Date.now();
  for (const p of ["/", "/services", "/faq", "/articles", "/contact", "/a-propos", "/login", "/register", "/commander"]) {
    const r = await fetch(B + p); check(`GET ${p} = 200`, r.status === 200, String(r.status));
  }
  const anon = new Client();
  const d = await anon.req("/dashboard");
  check("anon /dashboard redirects to login", [302, 307].includes(d.status), String(d.status));
  check("anon POST /api/orders = 401", (await anon.req("/api/orders", { method: "POST", body: form({}) })).status === 401);
  check("anon /api/admin/services = 401", (await anon.req("/api/admin/services", { method: "POST", json: {} })).status === 401);

  const email = `E2E.Client${stamp}@Test.Local`;
  const client = new Client();
  const reg = await client.req("/api/auth/sign-up/email", { method: "POST", json: { name: "E2E Client", email, password: "Passw0rd!Long", firstName: "E2E", lastName: "Client", termsAccepted: true } });
  check("register client", reg.status === 200, `${reg.status} ${await reg.text()}`);
  const dbUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  check("registered user has role CLIENT", dbUser?.role === "CLIENT");
  check("client /dashboard = 200", (await client.req("/dashboard")).status === 200);
  check("client /admin redirected", [302, 307].includes((await client.req("/admin")).status));
  check("client cannot use admin API (403)", (await client.req("/api/admin/services", { method: "POST", json: {} })).status === 403);
  const other = new Client();
  const email2 = `e2e.other${stamp}@test.local`;
  await other.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Other User", email: email2, password: "Passw0rd!Long", firstName: "Other", lastName: "User", termsAccepted: true } });

  const service = await prisma.service.findFirst({ where: { active: true, pricePerPage: { gt: 0 } } });
  if (!service) throw new Error("no orderable service");
  const base = { serviceId: service.id, sourceLang: "ar", targetLang: "fr", pages: "3", delayKey: "delay.standard", destinationCountry: "France", receivingAuthority: "Préfecture de Paris", purpose: "Dossier de naturalisation", certificationNeeds: "CERTIFIED", deliveryMethod: "DIGITAL", deliveryAddress: "", clientNotes: "Merci de respecter la graphie des noms propres." };
  const file = { data: pdf(), name: "acte.pdf", type: "application/pdf" };
  let r = await client.req("/api/orders", { method: "POST", body: form({ ...base, targetLang: "ar" }, file) });
  check("same source/target language rejected (400)", r.status === 400, String(r.status));
  r = await client.req("/api/orders", { method: "POST", body: form(base, { data: Buffer.from("MZ not a pdf"), name: "evil.pdf", type: "application/pdf" }) });
  check("fake PDF rejected (400)", r.status === 400, String(r.status));
  r = await client.req("/api/orders", { method: "POST", body: form({ ...base, delayKey: "delay.nope" }, file) });
  check("unknown delay rejected (400)", r.status === 400, String(r.status));
  r = await client.req("/api/orders", { method: "POST", body: form(base) });
  check("missing file rejected (400)", r.status === 400, String(r.status));
  r = await client.req("/api/orders", { method: "POST", body: form(base, file) });
  const created = await r.json().catch(() => ({}));
  check("valid order created (201)", r.status === 201 && !!created.id, `${r.status} ${JSON.stringify(created)}`);
  const orderId: string = created.id;
  let order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { documents: true } });
  check("status DEVIS_A_VALIDER", order.status === "DEVIS_A_VALIDER");
  check("quote: advance+balance = total", order.advanceAmount.add(order.balanceAmount).equals(order.totalAmount), `${order.totalAmount}`);
  const src = order.documents.find((d) => d.kind === "SOURCE")!;

  check("other user cannot accept quote (403)", (await other.req(`/api/orders/${orderId}/accept-quote`, { method: "POST" })).status === 403);
  check("other user cannot download source (403)", (await other.req(`/api/orders/${orderId}/documents/${src.id}/download`)).status === 403);
  const dl = await client.req(`/api/orders/${orderId}/documents/${src.id}/download`);
  check("owner downloads source (200, pdf)", dl.status === 200 && dl.headers.get("content-type") === "application/pdf", String(dl.status));
  check("Content-Disposition has filename*", /filename\*=UTF-8''acte\.pdf/.test(dl.headers.get("content-disposition") ?? ""), dl.headers.get("content-disposition") ?? "");

  check("advance payment refused before quote accepted (409)", (await client.req(`/api/orders/${orderId}/payment/advance`, { method: "POST" })).status === 409);
  const races = await Promise.all([1, 2, 3].map(() => client.req(`/api/orders/${orderId}/accept-quote`, { method: "POST" })));
  const codes = races.map((x) => x.status).sort();
  check("concurrent accept-quote: exactly one 200", codes.filter((c) => c === 200).length === 1, codes.join(","));
  const hist = await prisma.orderStatusHistory.count({ where: { orderId, status: "EN_ATTENTE_ACOMPTE" } });
  check("only one history row for EN_ATTENTE_ACOMPTE", hist === 1, String(hist));

  r = await client.req(`/api/orders/${orderId}/payment/advance`, { method: "POST" });
  const adv = await r.json();
  check("advance payment created", r.status === 200 && adv.redirectUrl?.startsWith("/paiement/mock/"), JSON.stringify(adv));
  const ref = adv.redirectUrl.split("/paiement/mock/")[1].split("?")[0];
  check("payment page renders for owner", (await client.req(adv.redirectUrl)).status === 200);
  check("other user cannot confirm payment (403)", (await other.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: ref } })).status === 403);
  check("webhook disabled with mock provider (404)", (await anon.req(`/api/payments/webhook?payment_ref=${ref}`)).status === 404);
  check("old POST webhook is gone (405)", (await anon.req("/api/payments/webhook", { method: "POST", json: { providerRef: ref } })).status === 405);
  r = await client.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: ref } });
  check("owner confirms advance", r.status === 200, await r.text());
  r = await client.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: ref } });
  check("confirm is idempotent", r.status === 200 && (await r.json()).alreadyProcessed === true);
  order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { documents: true } });
  check("status ACOMPTE_PAYE + advancePaid", order.status === "ACOMPTE_PAYE" && order.advancePaid);

  const admin = new Client();
  check("admin login", (await admin.login("admin@makram-arfaoui.local", "Demo12345!")) === 200);
  check("admin /admin = 200", (await admin.req("/admin")).status === 200);
  check("admin /admin/orders = 200", (await admin.req("/admin/orders")).status === 200);
  check("admin /admin/orders/[id] = 200", (await admin.req(`/admin/orders/${orderId}`)).status === 200);
  check("client cannot start translation (403)", (await client.req(`/api/admin/orders/${orderId}/status`, { method: "POST" })).status === 403);
  const upEarly = await admin.req(`/api/admin/orders/${orderId}/document`, { method: "POST", body: form({}, file) });
  check("upload refused before translation started (409)", upEarly.status === 409, String(upEarly.status));
  check("admin starts translation", (await admin.req(`/api/admin/orders/${orderId}/status`, { method: "POST" })).status === 200);
  check("start translation twice refused (409)", (await admin.req(`/api/admin/orders/${orderId}/status`, { method: "POST" })).status === 409);
  const ups = await Promise.all([1, 2].map(() => admin.req(`/api/admin/orders/${orderId}/document`, { method: "POST", body: form({}, { data: pdfText(), name: "traduction é.pdf", type: "application/pdf" }) })));
  const upCodes = ups.map((x) => x.status).sort();
  check("concurrent translated upload: exactly one 200", upCodes.filter((c) => c === 200).length === 1, upCodes.join(","));
  const tcount = await prisma.document.count({ where: { orderId, kind: "TRANSLATED" } });
  check("exactly one TRANSLATED document", tcount === 1, String(tcount));
  order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { documents: true } });
  check("status FICHIER_EN_ATTENTE_DE_SOLDE", order.status === "FICHIER_EN_ATTENTE_DE_SOLDE", order.status);
  let tr = order.documents.find((d) => d.kind === "TRANSLATED")!;

  check("client download before balance = 402", (await client.req(`/api/orders/${orderId}/documents/${tr.id}/download`)).status === 402);
  check("client preview = 423 (locked)", (await client.req(`/api/orders/${orderId}/documents/${tr.id}/preview`)).status === 423);
  const pv = await admin.req(`/api/orders/${orderId}/documents/${tr.id}/preview?page=1`);
  check("admin watermark preview (200 jpeg)", pv.status === 200 && pv.headers.get("content-type") === "image/jpeg", String(pv.status));
  check("advance again refused (409)", (await client.req(`/api/orders/${orderId}/payment/advance`, { method: "POST" })).status === 409);
  // --- Aperçu protégé avant paiement + demande de modification ---
  const preUrl = (docId: string) => `/api/orders/${orderId}/documents/${docId}/client-preview`;
  r = await client.req(`/api/orders/${orderId}/payment/balance`, { method: "POST" });
  check("balance refused until the preview was viewed (409 PREVIEW_REQUIRED)", r.status === 409 && (await r.json()).code === "PREVIEW_REQUIRED", String(r.status));
  check("client preview: anonymous = 401", (await anon.req(preUrl(tr.id) + "?meta=1")).status === 401);
  check("client preview: other user = 403", (await other.req(preUrl(tr.id) + "?meta=1")).status === 403);
  check("client preview: staff is not the owner = 403", (await admin.req(preUrl(tr.id) + "?meta=1")).status === 403);
  r = await client.req(preUrl(tr.id) + "?meta=1");
  const previewMeta = await r.json();
  check("client preview meta (>= 1 page)", r.status === 200 && previewMeta.pageCount >= 1, JSON.stringify(previewMeta));
  check("client preview: invalid page = 400", (await client.req(preUrl(tr.id) + "?page=999")).status === 400);
  check("previewViewedAt not set by the metadata call alone", (await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).previewViewedAt === null);
  const clientPage = await client.req(preUrl(tr.id) + "?page=1");
  const clientPageBytes = Buffer.from(await clientPage.arrayBuffer());
  check("client preview page = watermarked low-res JPEG, no-store", clientPage.status === 200 && clientPage.headers.get("content-type") === "image/jpeg" && /no-store/.test(clientPage.headers.get("cache-control") ?? "") && clientPageBytes[0] === 0xff && clientPageBytes[1] === 0xd8, String(clientPage.status));
  const viewedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  check("viewing a page records previewViewedAt + audit", viewedOrder.previewViewedAt !== null && (await prisma.auditLog.count({ where: { action: "PREVIEW_VIEWED", resource: `order:${orderId}` } })) === 1);
  check("the real file is still locked after the preview (402)", (await client.req(`/api/orders/${orderId}/documents/${tr.id}/download`)).status === 402);

  check("revision: note too short = 400", (await client.req(`/api/orders/${orderId}/revision`, { method: "POST", json: { note: "ab" } })).status === 400);
  check("revision: other user = 403", (await other.req(`/api/orders/${orderId}/revision`, { method: "POST", json: { note: "Nom mal orthographié" } })).status === 403);
  r = await client.req(`/api/orders/${orderId}/revision`, { method: "POST", json: { note: "Le nom du père est mal orthographié." } });
  check("client requests a modification", r.status === 200, await r.text());
  r = await client.req(`/api/orders/${orderId}/revision`, { method: "POST", json: { note: "Deuxième demande identique." } });
  check("a second request while one is pending = 409", r.status === 409 && (await r.json()).code === "REVISION_NOT_ALLOWED");
  r = await client.req(`/api/orders/${orderId}/payment/balance`, { method: "POST" });
  check("balance suspended while a modification is pending (409 REVISION_PENDING)", r.status === 409 && (await r.json()).code === "REVISION_PENDING");
  check("admin order page shows the request (200)", (await admin.req(`/admin/orders/${orderId}`)).status === 200);
  const replaced = await admin.req(`/api/admin/orders/${orderId}/document`, { method: "POST", body: form({}, { data: pdfText(), name: "traduction é.pdf", type: "application/pdf" }) });
  check("admin replaces the file after the request", replaced.status === 200, await replaced.text());
  const afterReplace = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { documents: true } });
  const newTr = afterReplace.documents.find((d) => d.kind === "TRANSLATED" && d.status === "READY")!;
  check("old version superseded, one READY translation, request cleared", newTr.id !== tr.id && afterReplace.documents.filter((d) => d.kind === "TRANSLATED" && d.status === "READY").length === 1 && afterReplace.revisionRequestedAt === null && afterReplace.previewViewedAt === null && afterReplace.status === "FICHIER_EN_ATTENTE_DE_SOLDE");
  check("old version preview is gone (404)", (await client.req(preUrl(tr.id) + "?meta=1")).status === 404);
  tr = newTr;
  r = await client.req(`/api/orders/${orderId}/payment/balance`, { method: "POST" });
  check("the new version must be previewed again (409 PREVIEW_REQUIRED)", r.status === 409 && (await r.json()).code === "PREVIEW_REQUIRED");
  check("client views the new version", (await client.req(preUrl(tr.id) + "?page=1")).status === 200);

  r = await client.req(`/api/orders/${orderId}/payment/balance`, { method: "POST" });
  const bal = await r.json();
  check("balance payment created", r.status === 200, JSON.stringify(bal));
  const bref = bal.redirectUrl.split("/paiement/mock/")[1].split("?")[0];
  check("client still locked while balance pending (402)", (await client.req(`/api/orders/${orderId}/documents/${tr.id}/download`)).status === 402);
  r = await client.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: bref } });
  check("balance confirmed", r.status === 200, await r.text());
  const dl2 = await client.req(`/api/orders/${orderId}/documents/${tr.id}/download`);
  check("client downloads translation after balance (200)", dl2.status === 200, String(dl2.status));
  check("non-ASCII filename header ok", /filename\*=UTF-8''traduction%20%C3%A9\.pdf/.test(dl2.headers.get("content-disposition") ?? ""), dl2.headers.get("content-disposition") ?? "");
  check("other user still forbidden (403)", (await other.req(`/api/orders/${orderId}/documents/${tr.id}/download`)).status === 403);
  const finalOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const order2 = finalOrder;
  check("final status TELECHARGEABLE + both paid", order2.status === "TELECHARGEABLE" && order2.advancePaid && order2.balancePaid, order2.status);
  check("audit log has DOCUMENT_DOWNLOADED", (await prisma.auditLog.count({ where: { action: "DOCUMENT_DOWNLOADED", resource: `document:${tr.id}` } })) >= 1);

  const newEmail = `Staff.MixedCase${stamp}@Test.Local`;
  r = await admin.req("/api/admin/users", { method: "POST", json: { firstName: "Mixed", lastName: "Case", email: newEmail, password: "Passw0rd!Long", role: "CLIENT" } });
  check("admin creates user", r.status === 201, `${r.status} ${await r.text()}`);
  const nu = await prisma.user.findFirst({ where: { email: newEmail.toLowerCase() } });
  check("email stored lowercase", !!nu && nu.email === newEmail.toLowerCase());
  const nc = new Client();
  check("admin-created user can log in with original casing", (await nc.login(newEmail, "Passw0rd!Long")) === 200);
  r = await admin.req("/api/admin/users", { method: "POST", json: { firstName: "Dup", lastName: "X", email: newEmail.toUpperCase(), password: "Passw0rd!Long", role: "CLIENT" } });
  check("duplicate email (other casing) rejected (409)", r.status === 409, String(r.status));

  const slug = `e2e-${stamp}`;
  r = await admin.req("/api/admin/articles", { method: "POST", json: { slug, title: "E2E", excerpt: "x", body: "y", coverImageUrl: "", published: true } });
  check("admin creates article", r.status === 201, String(r.status));
  check("article public page (200)", (await fetch(`${B}/articles/${slug}`)).status === 200);
  const art = (await r.json()).article;
  check("admin deletes article", (await admin.req(`/api/admin/articles/${art.id}`, { method: "DELETE" })).status === 200);
  check("deleted article 404", (await fetch(`${B}/articles/${slug}`)).status === 404);
  // --- second batch of fixes ---
  r = await admin.req("/api/admin/articles", { method: "POST", json: { slug: `js-${stamp}`, title: "x", excerpt: "x", body: "y", coverImageUrl: "javascript:alert(1)", published: false } });
  check("javascript: URL rejected (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/faq", { method: "POST", json: { question: "q", answer: "a", active: "false" } });
  check("string 'false' no longer coerced to true (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/home-sections/does-not-exist/visibility", { method: "POST", json: { visible: true } });
  check("visibility on missing section = 404", r.status === 404, String(r.status));
  check("robots.txt", (await fetch(`${B}/robots.txt`)).status === 200);
  const sm = await fetch(`${B}/sitemap.xml`);
  check("sitemap.xml", sm.status === 200 && (await sm.text()).includes("<urlset"));
  check("CSP header present", !!(await fetch(B)).headers.get("content-security-policy"));

  // payment reuse: second order, click "pay advance" twice
  r = await client.req("/api/orders", { method: "POST", body: form(base, file) });
  const o2 = (await r.json()).id as string;
  await client.req(`/api/orders/${o2}/accept-quote`, { method: "POST" });
  const p1 = await (await client.req(`/api/orders/${o2}/payment/advance`, { method: "POST" })).json();
  const p2 = await (await client.req(`/api/orders/${o2}/payment/advance`, { method: "POST" })).json();
  check("pending payment reused on second click", p1.redirectUrl === p2.redirectUrl, `${p1.redirectUrl} vs ${p2.redirectUrl}`);
  check("only one PENDING payment row", (await prisma.payment.count({ where: { orderId: o2 } })) === 1);

  // Acompte encaissé en espèces au cabinet (enregistré par l'admin)
  check("client cannot record a cash deposit (403)", (await client.req(`/api/admin/orders/${o2}/cash-advance`, { method: "POST" })).status === 403);
  check("anonymous cannot record a cash deposit (401)", (await anon.req(`/api/admin/orders/${o2}/cash-advance`, { method: "POST" })).status === 401);
  r = await admin.req(`/api/admin/orders/${o2}/cash-advance`, { method: "POST" });
  check("admin records the cash deposit", r.status === 200, await r.text());
  const cashOrder = await prisma.order.findUniqueOrThrow({ where: { id: o2 }, include: { payments: true } });
  check("cash deposit: ACOMPTE_PAYE, CASH payment SUCCEEDED, online attempt retired", cashOrder.status === "ACOMPTE_PAYE" && cashOrder.advancePaid && cashOrder.payments.some((p) => p.provider === "CASH" && p.status === "SUCCEEDED") && !cashOrder.payments.some((p) => p.status === "PENDING"));
  check("cash deposit recorded twice = 409", (await admin.req(`/api/admin/orders/${o2}/cash-advance`, { method: "POST" })).status === 409);
  check("audit has the cash confirmation", (await prisma.auditLog.count({ where: { action: "PAYMENT_CONFIRMED", resource: `payment:${cashOrder.payments.find((p) => p.provider === "CASH")!.id}` } })) === 1);
  const refOk = /^CMD-\d{4}-[0-9A-F]{8}$/.test((await prisma.order.findUniqueOrThrow({ where: { id: o2 } })).reference);
  check("order reference format", refOk);

  // media in use
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  r = await admin.req("/api/admin/media", { method: "POST", body: form({}, { data: png, name: "t.png", type: "image/png" }) });
  const media = (await r.json()).media;
  check("media upload", r.status === 201 && !!media?.url, String(r.status));
  r = await admin.req("/api/admin/articles", { method: "POST", json: { slug: `m-${stamp}`, title: "m", excerpt: "x", body: "y", coverImageUrl: media.url, published: false } });
  const art2 = (await r.json()).article;
  check("article with internal image URL accepted", r.status === 201, String(r.status));
  check("deleting in-use media refused (409)", (await admin.req(`/api/admin/media/${media.id}`, { method: "DELETE" })).status === 409);
  await admin.req(`/api/admin/articles/${art2.id}`, { method: "DELETE" });
  check("deleting unused media ok", (await admin.req(`/api/admin/media/${media.id}`, { method: "DELETE" })).status === 200);

  // last-admin guard
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  if (admins.length === 1) {
    const me = admins[0];
    const tmp = new Client(); void tmp;
    r = await admin.req(`/api/admin/users/${me.id}`, { method: "DELETE" });
    check("cannot delete own/last admin", r.status === 400 || r.status === 409, String(r.status));
  } else check("last-admin guard (skipped: multiple admins)", true);

  // --- multilingual content, theme, ordering, localized UI ---
  const html = async (path: string, cookie?: string) => {
    const res = await fetch(B + path, { headers: cookie ? { cookie } : {} });
    return { status: res.status, text: await res.text() };
  };
  const tslug = `tr-${stamp}`;
  r = await admin.req("/api/admin/articles", { method: "POST", json: { slug: tslug, title: "Titre FR", excerpt: "Résumé FR", body: "Corps FR", coverImageUrl: "", published: true, translations: { en: { title: "English title", excerpt: "English summary", body: "English body" }, ar: { title: "عنوان عربي" } } } });
  const trArt = (await r.json()).article;
  check("article with translations created", r.status === 201 && !!trArt?.id, String(r.status));
  let page = await html(`/articles/${tslug}`, "site_locale=en");
  check("EN visitor sees English title", page.text.includes("English title"), "missing");
  page = await html(`/articles/${tslug}`, "site_locale=fr");
  check("FR visitor sees French title", page.text.includes("Titre FR") && !page.text.includes("English title"));
  page = await html(`/articles/${tslug}`, "site_locale=ar");
  check("AR visitor sees Arabic title, French fallback for body", page.text.includes("عنوان عربي") && page.text.includes("Corps FR"));
  page = await html(`/articles/${tslug}`, "site_locale=it");
  check("IT visitor falls back to French", page.text.includes("Titre FR"));
  page = await html("/articles", "site_locale=en");
  check("EN articles list uses translation", page.text.includes("English summary"));
  const del1 = await admin.req(`/api/admin/articles/${trArt.id}`, { method: "DELETE" });
  check("translated article deleted", del1.status === 200);

  // theme
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { blue: "#ff0000" } } });
  check("theme saved", r.status === 200, String(r.status));
  page = await html("/", "site_locale=fr");
  check("public page carries custom colour", page.text.includes("--color-blue:#ff0000"), "style missing");
  page = await html("/fr/services");
  check("custom colour applies to other pages", page.text.includes("--color-blue:#ff0000"));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { blue: "red" } } });
  check("invalid colour rejected (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { nope: "#ffffff" } } });
  check("unknown token rejected (400)", r.status === 400, String(r.status));
  check("client cannot change theme (403)", (await client.req("/api/admin/theme", { method: "PUT", json: { values: {} } })).status === 403);
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {} } });
  page = await html("/", "site_locale=fr");
  check("theme reset removes override", r.status === 200 && !page.text.includes("--color-blue:#ff0000"));

  // service ordering + translations
  const mk = async (name: string) => (await (await admin.req("/api/admin/services", { method: "POST", json: { slug: `svc-${name.toLowerCase()}-${stamp}`, name, description: "d", pricePerPage: 1, imageUrl: "", active: true, translations: { en: { name: `${name} EN` } } } })).json()).service;
  const sA = await mk("AAA"); const sB = await mk("BBB");
  const svcOrder = async () => (await prisma.service.findMany({ where: { id: { in: [sA.id, sB.id] } }, orderBy: { order: "asc" } })).map((s) => s.name);
  check("new services appended in creation order", (await svcOrder()).join() === "AAA,BBB");
  r = await admin.req(`/api/admin/services/${sB.id}/move`, { method: "POST", json: { direction: "up" } });
  check("service moved up", r.status === 200 && (await svcOrder()).join() === "BBB,AAA", (await svcOrder()).join());
  page = await html("/services", "site_locale=en");
  check("services page: order + EN translation", page.text.indexOf("BBB EN") > -1 && page.text.indexOf("BBB EN") < page.text.indexOf("AAA EN"));
  for (const s of [sA, sB]) await admin.req(`/api/admin/services/${s.id}`, { method: "DELETE" });
  await prisma.service.deleteMany({ where: { id: { in: [sA.id, sB.id] } } });

  // localized app + admin UI
  const asText = async (c: Client, path: string, locale: string) => {
    c.jar.set("site_locale", locale);
    const x = await c.req(path);
    return { status: x.status, text: await x.text() };
  };
  page = await asText(client, "/dashboard", "ar");
  check("client dashboard renders in Arabic (rtl)", page.status === 200 && page.text.includes('lang="ar"') && page.text.includes('dir="rtl"') && page.text.includes("طلباتي"), String(page.status));
  page = await asText(client, "/dashboard", "en");
  check("client dashboard renders in English", page.text.includes("My orders") && !page.text.includes("Mes commandes"));
  page = await asText(admin, "/admin", "en");
  check("admin renders in English", page.status === 200 && page.text.includes("Overview") && page.text.includes("Appearance"), String(page.status));
  page = await asText(admin, "/admin/theme", "it");
  check("admin theme page renders in Italian", page.status === 200 && page.text.includes("Aspetto e colori"), String(page.status));
  admin.jar.set("site_locale", "fr");
  r = await admin.req("/admin/services/new");
  check("admin service form has translation editor", (await r.text()).includes("Traductions"));
  r = await fetch(`${B}/commander?service=x`, { headers: { cookie: "site_locale=en" } });
  check("order page metadata localized", (await r.text()).includes("Order a translation"));
  check("robots.txt still served", (await fetch(`${B}/robots.txt`)).status === 200);

  // --- full theme control: fonts, extended colours, custom logo ---
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { danger: "#aa0000", edge: "#cccccc" }, fonts: { heading: "lora", body: "poppins" } } });
  check("theme with fonts saved", r.status === 200, String(r.status));
  page = await html("/", "site_locale=fr");
  check("custom fonts applied on <html>", page.text.includes("--font-heading:var(--font-lora)") && page.text.includes("--font-body:var(--font-poppins)"));
  check("extended colour tokens applied", page.text.includes("--color-danger:#aa0000") && page.text.includes("--color-edge:#cccccc"));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: { heading: "comic-sans" } } });
  check("unknown font rejected (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: {} } });
  page = await html("/", "site_locale=fr");
  check("fonts and colours reset to defaults", r.status === 200 && !page.text.includes("--font-heading") && !page.text.includes("--color-danger"));
  page = await asText(admin, "/admin/theme", "fr");
  check("theme page shows presets, fonts and contrast checker", page.text.includes("Émeraude") && page.text.includes("Police des titres") && page.text.includes("Lisibilité"));
  await prisma.siteContent.upsert({ where: { key_locale: { key: "brand.logoUrl", locale: "fr" } }, create: { key: "brand.logoUrl", locale: "fr", value: "/uploads/media/e2e-logo.png" }, update: { value: "/uploads/media/e2e-logo.png" } });
  page = await html("/", "site_locale=fr");
  check("custom logo from content settings is used", page.text.includes("/uploads/media/e2e-logo.png"));
  await prisma.siteContent.delete({ where: { key_locale: { key: "brand.logoUrl", locale: "fr" } } });
  page = await html("/", "site_locale=fr");
  check("default logo restored", !page.text.includes("e2e-logo.png"));

  // --- layout, Arabic fonts, contrast policy, custom fonts ---
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: { headingAr: "cairo", bodyAr: "tajawal" }, layout: { radius: 1.5, width: 1300, section: 0.8 } } });
  check("layout + Arabic fonts saved", r.status === 200, String(r.status));
  page = await html("/", "site_locale=fr");
  check("layout variables on <html>", page.text.includes("--radius-scale:1.5") && page.text.includes("--site-width:1300px") && page.text.includes("--section-scale:0.8"));
  check("Arabic font variables on <html>", page.text.includes("--font-heading-ar:var(--font-cairo)") && page.text.includes("--font-body-ar:var(--font-tajawal)"));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, layout: { radius: 5 } } });
  check("out-of-range layout rejected (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: { headingAr: "comic-sans" } } });
  check("unknown Arabic font rejected (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: { body: "playfair" } } });
  check("serif font refused for body slot (400)", r.status === 400, String(r.status));

  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { blue: "#eeeeee" }, policy: "block" } });
  const low = await r.json().catch(() => ({}));
  check("unreadable colours blocked by policy (422)", r.status === 422 && low.code === "LOW_CONTRAST" && low.pairs?.includes("whiteOnBlue"), `${r.status} ${JSON.stringify(low)}`);
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, policy: "strict" } });
  check("the default palette meets WCAG AA, so strict mode accepts it (200)", r.status === 200, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { muted: "#74839b" }, policy: "strict" } });
  const weak = await r.json().catch(() => ({}));
  check("strict AA policy rejects a 3.8:1 secondary-text colour (422)", r.status === 422 && weak.pairs?.includes("mutedOnPaper"), `${r.status} ${JSON.stringify(weak)}`);
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { muted: "#74839b" }, policy: "block" } });
  check("the default 'block' policy still allows 3.8:1 (not hard to read)", r.status === 200, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: { blue: "#eeeeee" }, policy: "off" } });
  check("policy 'off' lets any colours through (200)", r.status === 200, String(r.status));
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, policy: "block" } });
  check("reset with default policy (200)", r.status === 200, String(r.status));
  page = await html("/", "site_locale=fr");
  check("everything back to defaults", !page.text.includes("--radius-scale") && !page.text.includes("--font-heading-ar") && !page.text.includes("--color-blue"));

  const fakeFont = Buffer.concat([Buffer.from("wOF2"), Buffer.alloc(512, 7)]);
  const fontForm = (slot: string, name: string, data: Buffer, fname = "brand.woff2") => { const f = new FormData(); f.set("slot", slot); f.set("name", name); f.set("file", new File([new Uint8Array(data)], fname)); return f; };
  check("client cannot upload fonts (403)", (await client.req("/api/admin/fonts", { method: "POST", body: fontForm("1", "X", fakeFont) })).status === 403);
  r = await admin.req("/api/admin/fonts", { method: "POST", body: fontForm("1", "Text <b>Brand</b>", Buffer.from("this is not a font at all")) });
  check("non-woff2 file rejected by signature (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/fonts", { method: "POST", body: fontForm("3", "Brand", fakeFont) });
  check("invalid slot rejected (400)", r.status === 400, String(r.status));
  r = await admin.req("/api/admin/fonts", { method: "POST", body: fontForm("1", "Text <b>Brand</b>", Buffer.concat([Buffer.from("wOF2"), Buffer.alloc(1_100_000)])) });
  check("oversized font rejected (400 size error or 413)", r.status === 413 || (r.status === 400 && (await r.json()).code === "FILE_TOO_LARGE"), String(r.status));
  r = await admin.req("/api/admin/fonts", { method: "POST", body: fontForm("1", "Cabinet <b>Brand</b>", fakeFont) });
  const uploadedFont = (await r.json().catch(() => ({}))).font;
  check("woff2 font uploaded (201), name sanitised", r.status === 201 && uploadedFont?.name === "Cabinet bBrandb" && /^\/uploads\/fonts\/[a-f0-9-]{36}\.woff2$/.test(uploadedFont?.url ?? ""), JSON.stringify(uploadedFont));
  const served = await fetch(`${B}${uploadedFont.url}`);
  check("uploaded font is served (font/woff2, immutable)", served.status === 200 && (served.headers.get("content-type") ?? "").includes("woff2"), `${served.status} ${served.headers.get("content-type")}`);
  check("path traversal on /uploads refused", (await fetch(`${B}/uploads/fonts/..%2F..%2Fpackage.json`)).status === 404);
  r = await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: { heading: "custom1", headingAr: "custom1" } } });
  check("custom font selectable in Latin and Arabic slots", r.status === 200, String(r.status));
  page = await html("/", "site_locale=fr");
  check("@font-face emitted for the custom font", page.text.includes('font-family:"SiteCustom1"') && page.text.includes(uploadedFont.url) && page.text.includes("--font-heading:var(--font-custom-1)"));
  check("custom font 2 not selectable before upload", (await admin.req("/api/admin/theme", { method: "PUT", json: { values: {}, fonts: { body: "custom2" } } })).status === 400);
  r = await admin.req("/api/admin/fonts?slot=1", { method: "DELETE" });
  page = await html("/", "site_locale=fr");
  check("deleting the font releases the slots and the CSS", r.status === 200 && !page.text.includes("SiteCustom1") && !page.text.includes("--font-heading:var(--font-custom-1)"));
  check("font file removed from disk", (await fetch(`${B}${uploadedFont.url}`)).status === 404);
  page = await asText(admin, "/admin/theme", "fr");
  check("theme page offers layout, Arabic fonts and custom fonts", page.text.includes("Mise en page") && page.text.includes("Cairo") && page.text.includes("Vos propres polices"));

  // --- order intake details (fulfilment) ---
  const mkForm = (patch: Record<string, string | null>) => {
    const f = form({ ...base }, file);
    for (const [k, v] of Object.entries(patch)) { if (v === null) f.delete(k); else f.set(k, v); }
    return f;
  };
  const submitOrder = async (patch: Record<string, string | null>) => client.req("/api/orders", { method: "POST", body: mkForm(patch) });
  const intakeOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  check("intake fields persisted on the order", intakeOrder.destinationCountry === "France" && intakeOrder.receivingAuthority === "Préfecture de Paris" && intakeOrder.purpose === "Dossier de naturalisation" && intakeOrder.certificationNeeds === "CERTIFIED" && intakeOrder.deliveryMethod === "DIGITAL" && !!intakeOrder.clientNotes);
  check("missing destination country rejected (400)", (await submitOrder({ destinationCountry: null })).status === 400);
  check("missing purpose rejected (400)", (await submitOrder({ purpose: "" })).status === 400);
  check("invalid certification option rejected (400)", (await submitOrder({ certificationNeeds: "HACK" })).status === 400);
  check("invalid delivery method rejected (400)", (await submitOrder({ deliveryMethod: "DRONE" })).status === 400);
  check("courier delivery requires an address (400)", (await submitOrder({ deliveryMethod: "COURIER", deliveryAddress: "" })).status === 400);
  check("courier delivery with address accepted (201)", (await submitOrder({ deliveryMethod: "COURIER", deliveryAddress: "12 rue de la Paix, 75002 Paris" })).status === 201);
  check("oversized notes rejected (400)", (await submitOrder({ clientNotes: "x".repeat(3001) })).status === 400);
  const adminOrderPage = await asText(admin, `/admin/orders/${orderId}`, "fr");
  check("admin order page shows the intake details", adminOrderPage.text.includes("France") && adminOrderPage.text.includes("Dossier de naturalisation") && adminOrderPage.text.includes("Préfecture de Paris"));
  const clientOrderPage = await asText(client, `/dashboard/orders/${orderId}`, "fr");
  check("client order page shows the intake details", clientOrderPage.text.includes("France") && clientOrderPage.text.includes("Dossier de naturalisation"));
  check("other clients cannot read the intake details (no 200 with data)", !(await asText(other, `/dashboard/orders/${orderId}`, "fr")).text.includes("Dossier de naturalisation"));

  // --- transactional e-mail outbox ---
  const outbox = (template: string, recipient: string) => prisma.emailOutbox.count({ where: { template, recipient } });
  const clientEmail = email.toLowerCase();
  check("ORDER_RECEIVED queued once per order", (await outbox("ORDER_RECEIVED", clientEmail)) >= 1);
  check("QUOTE_ACCEPTED queued", (await outbox("QUOTE_ACCEPTED", clientEmail)) >= 1);
  check("PAYMENT_CONFIRMED queued for the advances (online + cash) and the balance", (await outbox("PAYMENT_CONFIRMED", clientEmail)) === 3, String(await outbox("PAYMENT_CONFIRMED", clientEmail)));
  check("TRANSLATION_READY queued (initial + replacement)", (await outbox("TRANSLATION_READY", clientEmail)) === 2);
  const queuedRow = await prisma.emailOutbox.findFirstOrThrow({ where: { template: "TRANSLATION_READY", recipient: clientEmail } });
  check("outbox row stores status, subject and link payload only", queuedRow.status === "PENDING" && queuedRow.subject.length > 0 && JSON.stringify(queuedRow.payload).includes("/dashboard/orders/"));
  const jobs = (token?: string) => fetch(`${B}/api/internal/jobs/email-outbox`, { method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {} });
  check("e-mail job refuses anonymous callers (401)", (await jobs()).status === 401);
  check("e-mail job refuses a wrong secret (401)", (await jobs("x".repeat(40))).status === 401);
  check("e-mail job refuses GET (405)", (await fetch(`${B}/api/internal/jobs/email-outbox`)).status === 405);
  const jobsSecret = process.env.JOBS_SECRET ?? "";
  check("JOBS_SECRET is configured for the test environment", jobsSecret.length >= 32);
  // Un lot = 25 messages max, et la base de dev peut contenir d'anciens messages : on vide la file.
  let processed = { ok: false, sent: 0, failed: 0 };
  for (let round = 0; round < 40; round++) {
    const batch = await (await jobs(jobsSecret)).json();
    processed = { ok: batch.ok === true, sent: processed.sent + batch.sent, failed: processed.failed + batch.failed };
    if (batch.sent === 0) break;
  }
  check("e-mail job delivers pending messages (dev log transport)", processed.ok && processed.sent >= 4 && processed.failed === 0, JSON.stringify(processed));
  check("delivered rows are SENT with a timestamp", (await prisma.emailOutbox.findUniqueOrThrow({ where: { id: queuedRow.id } })).status === "SENT");
  const again = await (await jobs(jobsSecret)).json();
  check("running the job again sends nothing twice", again.sent === 0, JSON.stringify(again));

  // --- forgot / reset password ---
  const resetEmail = `reset.${stamp}@test.local`;
  const resetUser = new Client();
  await resetUser.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Reset User", email: resetEmail, password: "OldPassw0rd!Long", firstName: "Reset", lastName: "User", termsAccepted: true } });
  check("forgot-password page renders", (await html("/mot-de-passe-oublie", "site_locale=fr")).status === 200);
  check("reset-password page renders", (await html("/reinitialiser-mot-de-passe?token=abc", "site_locale=fr")).status === 200);
  r = await new Client().req("/api/auth/request-password-reset", { method: "POST", json: { email: resetEmail, redirectTo: "/reinitialiser-mot-de-passe" } });
  check("password reset request accepted (200)", r.status === 200, String(r.status));
  r = await new Client().req("/api/auth/request-password-reset", { method: "POST", json: { email: `ghost.${stamp}@test.local`, redirectTo: "/reinitialiser-mot-de-passe" } });
  check("unknown e-mail gets the same answer (no account enumeration)", r.status === 200, String(r.status));
  check("...and no e-mail is queued for it", (await outbox("RESET_PASSWORD", `ghost.${stamp}@test.local`)) === 0);
  const resetRow = await prisma.emailOutbox.findFirstOrThrow({ where: { template: "RESET_PASSWORD", recipient: resetEmail } });
  const resetUrl = String((resetRow.payload as { url?: string }).url ?? "");
  const token = resetUrl.split("/reset-password/")[1]?.split("?")[0] ?? "";
  check("reset e-mail carries a one-time link to this site", resetUrl.startsWith(B) && token.length > 10, resetUrl);
  r = await new Client().req("/api/auth/reset-password", { method: "POST", json: { token: "not-a-real-token", newPassword: "NewPassw0rd!Long" } });
  check("invalid token rejected", r.status >= 400, String(r.status));
  r = await new Client().req("/api/auth/reset-password", { method: "POST", json: { token, newPassword: "short" } });
  check("too-short new password rejected", r.status >= 400, String(r.status));
  r = await new Client().req("/api/auth/reset-password", { method: "POST", json: { token, newPassword: "NewPassw0rd!Long" } });
  check("valid token sets the new password (200)", r.status === 200, String(r.status));
  check("new password logs in", (await new Client().login(resetEmail, "NewPassw0rd!Long")) === 200);
  check("old password no longer works", (await new Client().login(resetEmail, "OldPassw0rd!Long")) !== 200);
  r = await new Client().req("/api/auth/reset-password", { method: "POST", json: { token, newPassword: "Another0ne!Long" } });
  check("a reset link cannot be used twice", r.status >= 400, String(r.status));
  check("sessions opened before the reset were revoked", (await resetUser.req("/api/auth/get-session")).status !== 200 || (await (await resetUser.req("/api/auth/get-session")).text()) === "null");

  // --- health, errors, structured data ---
  r = await fetch(`${B}/api/health/live`);
  check("liveness probe", r.status === 200 && (await r.json()).ok === true && (r.headers.get("cache-control") ?? "").includes("no-store"));
  r = await fetch(`${B}/api/health/ready`);
  check("readiness probe checks database + storage", r.status === 200 && (await r.json()).ok === true);
  r = await fetch(`${B}/fr/page-qui-nexiste-pas`);
  check("unknown page returns a styled 404", r.status === 404 && (await r.text()).includes("<html"));
  page = await html("/", "site_locale=fr");
  const ld = [...page.text.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1].replaceAll("\\u003c", "<")); } catch { return null; } });
  check("home page embeds valid JSON-LD", ld.length > 0 && ld.every((item) => item && item["@context"]), JSON.stringify(ld).slice(0, 120));
  check("JSON-LD contains no invented ratings or reviews", !JSON.stringify(ld).includes("aggregateRating") && !JSON.stringify(ld).includes('"review"'));
  r = await fetch(`${B}/opengraph-image`);
  check("Open Graph image is served", r.status === 200 && (r.headers.get("content-type") ?? "").startsWith("image/"), `${r.status} ${r.headers.get("content-type")}`);

  // --- pricing rules (delay coefficients) ---
  const patchRule = (key: string, json: unknown, c: Client = admin) => c.req(`/api/admin/pricing-rules/${key}`, { method: "PATCH", json });
  const originalRules = await prisma.pricingRule.findMany();
  const express = originalRules.find((rule) => rule.key === "delay.express")!;
  r = await patchRule("delay.express", { multiplier: 1.8, active: true });
  check("coefficient updated (200)", r.status === 200 && Number((await r.json()).rule.multiplier) === 1.8, String(r.status));
  check("pricing change is audited with before/after", (await prisma.auditLog.count({ where: { action: "PRICING_RULE_UPDATED", resource: "pricingRule:delay.express" } })) >= 1);
  check("coefficient below 0.5 rejected (400)", (await patchRule("delay.express", { multiplier: 0.1, active: true })).status === 400);
  check("coefficient above 5 rejected (400)", (await patchRule("delay.express", { multiplier: 13, active: true })).status === 400);
  check("non-numeric coefficient rejected (400)", (await patchRule("delay.express", { multiplier: "abc", active: true })).status === 400);
  check("unknown delay rule is 404", (await patchRule("delay.nope", { multiplier: 1, active: true })).status === 404);
  check("client cannot change prices (403)", (await patchRule("delay.express", { multiplier: 1, active: true }, client)).status === 403);
  check("anonymous cannot change prices (401)", (await patchRule("delay.express", { multiplier: 1, active: true }, new Client())).status === 401);
  // Client dédié : les plafonds anti-abus (15 commandes/heure/utilisateur) restent actifs pendant les tests.
  const pricingClient = new Client();
  await pricingClient.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Pricing Test", email: `pricing.${stamp}@test.local`, password: "Passw0rd!Long", firstName: "Pricing", lastName: "Test", termsAccepted: true } });
  const quoted = await (await pricingClient.req("/api/orders", { method: "POST", body: mkForm({ delayKey: "delay.express", pages: "10" }) })).json();
  const expressOrder = await prisma.order.findUniqueOrThrow({ where: { id: quoted.id } });
  const expectedTotal = service.pricePerPage.mul(10).mul(1.8).toDecimalPlaces(3);
  check("a new order is quoted with the new coefficient", expressOrder.totalAmount.equals(expectedTotal), `${expressOrder.totalAmount} vs ${expectedTotal}`);
  await patchRule("delay.express", { multiplier: 2.5, active: true });
  check("an existing order keeps the price it was created with", (await prisma.order.findUniqueOrThrow({ where: { id: quoted.id } })).totalAmount.equals(expectedTotal));
  await patchRule("delay.express", { multiplier: 1.8, active: false });
  r = await pricingClient.req("/api/orders", { method: "POST", body: mkForm({ delayKey: "delay.express" }) });
  check("a deactivated delay can no longer be ordered (400)", r.status === 400 && (await r.json()).code === "INVALID_DELAY");
  const orderPage = await html("/commander", "site_locale=fr");
  check("the order form only offers active delays", orderPage.text.includes("Standard") && !orderPage.text.includes("Express (48"));
  for (const rule of originalRules.filter((item) => item.key !== "delay.standard")) await patchRule(rule.key, { multiplier: Number(rule.multiplier), active: false });
  r = await patchRule("delay.standard", { multiplier: 1, active: false });
  check("the last active delay cannot be deactivated (409)", r.status === 409 && (await r.json()).code === "LAST_ACTIVE_RULE", String(r.status));
  for (const rule of originalRules) await patchRule(rule.key, { multiplier: Number(rule.multiplier), active: rule.active });
  const restored = await prisma.pricingRule.findUniqueOrThrow({ where: { key: "delay.express" } });
  check("original coefficients restored after the test", restored.multiplier?.equals(express.multiplier!) === true && restored.active === express.active);
  page = await asText(admin, "/admin/pricing", "fr");
  check("pricing admin page renders the three delays", page.status === 200 && page.text.includes("coefficients") && page.text.includes("delay.express") && page.text.includes("delay.urgent"), String(page.status));

  // --- admin quote adjustment ---
  const quoteClient = new Client();
  await quoteClient.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Quote Test", email: `quote.${stamp}@test.local`, password: "Passw0rd!Long", firstName: "Quote", lastName: "Test", termsAccepted: true } });
  const newQuoteOrder = async (pages: string) => (await (await quoteClient.req("/api/orders", { method: "POST", body: mkForm({ pages }) })).json()).id as string;
  const adjust = (id: string, json: unknown, c: Client = admin) => c.req(`/api/admin/orders/${id}/quote`, { method: "POST", json });
  const qOrder = await newQuoteOrder("4");
  const q0 = await prisma.order.findUniqueOrThrow({ where: { id: qOrder } });
  r = await adjust(qOrder, { pages: 6, reason: "Le document compte 6 pages et non 4." });
  const q1 = await prisma.order.findUniqueOrThrow({ where: { id: qOrder } });
  check("pages-only adjustment keeps the original unit price (total x 6/4)", r.status === 200 && q1.pages === 6 && q1.totalAmount.equals(q0.totalAmount.mul(6).div(4).toDecimalPlaces(3)), `${q0.totalAmount} -> ${q1.totalAmount}`);
  check("advance + balance always equal the total", q1.advanceAmount.add(q1.balanceAmount).equals(q1.totalAmount));
  check("the adjustment is audited with reason, before and after", (await prisma.auditLog.count({ where: { action: "QUOTE_ADJUSTED", resource: `order:${qOrder}` } })) === 1);
  check("the adjustment appears in the order history with its reason", (await prisma.orderStatusHistory.count({ where: { orderId: qOrder, note: { contains: "Le document compte 6 pages" } } })) === 1);
  check("the client is e-mailed about the new quote", (await prisma.emailOutbox.count({ where: { template: "QUOTE_UPDATED", recipient: `quote.${stamp}@test.local` } })) === 1);
  r = await adjust(qOrder, { pages: 6, total: 123.456, reason: "Tarif négocié par téléphone." });
  const q2 = await prisma.order.findUniqueOrThrow({ where: { id: qOrder } });
  check("a negotiated total overrides the computed one (50/50 split)", r.status === 200 && q2.totalAmount.equals("123.456") && q2.advanceAmount.add(q2.balanceAmount).equals("123.456"), `${q2.totalAmount}`);
  check("adjustment without a reason rejected (400)", (await adjust(qOrder, { pages: 7, reason: "" })).status === 400);
  check("zero pages rejected (400)", (await adjust(qOrder, { pages: 0, reason: "erreur" })).status === 400);
  check("negative total rejected (400)", (await adjust(qOrder, { pages: 6, total: -5, reason: "erreur" })).status === 400);
  r = await adjust(qOrder, { pages: 6, total: 123.456, reason: "Rien ne change." });
  check("an adjustment that changes nothing is refused (400 NO_CHANGE)", r.status === 400 && (await r.json()).code === "NO_CHANGE");
  check("clients cannot adjust their own quote (403)", (await adjust(qOrder, { pages: 1, total: 1, reason: "je triche" }, quoteClient)).status === 403);
  check("unknown order is 404", (await adjust("doesnotexist", { pages: 2, reason: "test" })).status === 404);
  check("adjust panel is shown for a quote awaiting approval", (await asText(admin, `/admin/orders/${qOrder}`, "fr")).text.includes("Ajuster le devis"));

  // the client accepts only the amount they actually saw
  r = await quoteClient.req(`/api/orders/${qOrder}/accept-quote`, { method: "POST", json: { expectedTotal: q0.totalAmount.toString() } });
  check("accepting a stale amount is refused (409 QUOTE_CHANGED)", r.status === 409 && (await r.json()).code === "QUOTE_CHANGED");
  check("...and the order is still awaiting approval", (await prisma.order.findUniqueOrThrow({ where: { id: qOrder } })).status === "DEVIS_A_VALIDER");
  r = await quoteClient.req(`/api/orders/${qOrder}/accept-quote`, { method: "POST", json: { expectedTotal: "123.456" } });
  check("accepting the current amount works (200)", r.status === 200, String(r.status));
  r = await adjust(qOrder, { pages: 9, total: 500, reason: "Trop tard." });
  check("an accepted quote can no longer be adjusted (409 QUOTE_LOCKED)", r.status === 409 && (await r.json()).code === "QUOTE_LOCKED");
  check("adjust panel is hidden once accepted", !(await asText(admin, `/admin/orders/${qOrder}`, "fr")).text.includes("Ajuster le devis"));

  // race: whatever the order of events, an accepted total is always the one the client saw
  let violations = 0;
  for (let trial = 0; trial < 8; trial++) {
    const raceOrder = await newQuoteOrder("2");
    const seen = (await prisma.order.findUniqueOrThrow({ where: { id: raceOrder } })).totalAmount;
    await Promise.all([
      quoteClient.req(`/api/orders/${raceOrder}/accept-quote`, { method: "POST", json: { expectedTotal: seen.toString() } }),
      adjust(raceOrder, { pages: 3, reason: `course ${trial}` }),
    ]);
    const final = await prisma.order.findUniqueOrThrow({ where: { id: raceOrder } });
    if (final.status !== "DEVIS_A_VALIDER" && !final.totalAmount.equals(seen)) violations++;
  }
  check("race accept vs adjust: the client never accepts a total they did not see", violations === 0, `${violations} violation(s)`);

  // --- visual editor: single-text API ---
  const entry = (json: unknown, c: Client = admin) => c.req("/api/admin/site-content/entry", { method: "PATCH", json });
  r = await entry({ locale: "fr", key: "hero.description", value: `Texte e2e ${stamp}` });
  const savedEntry = await r.json().catch(() => ({}));
  check("single text saved", r.status === 200 && savedEntry.customized === true, String(r.status));
  check("saved text appears on the public page", (await html("/", "site_locale=fr")).text.includes(`Texte e2e ${stamp}`));
  check("other languages untouched", !(await html("/", "site_locale=en")).text.includes(`Texte e2e ${stamp}`));
  const before = await prisma.siteContent.count();
  r = await entry({ locale: "fr", key: "hero.credential", value: `Autre ${stamp}` });
  check("saving a second text keeps the first one", r.status === 200 && (await prisma.siteContent.count()) === before + 1 && (await html("/", "site_locale=fr")).text.includes(`Texte e2e ${stamp}`));
  r = await entry({ locale: "fr", key: "hero.credential", value: null });
  r = await entry({ locale: "fr", key: "hero.description", value: null });
  check("null restores the original text", r.status === 200 && (await r.json()).customized === false && !(await html("/", "site_locale=fr")).text.includes(`Texte e2e ${stamp}`));
  r = await entry({ locale: "fr", key: "adm.save", value: "Hack" });
  check("admin-interface keys are not editable (400)", r.status === 400 && (await r.json()).code === "KEY_NOT_EDITABLE");
  check("unknown key rejected (400)", (await entry({ locale: "fr", key: "nope.nothing", value: "x" })).status === 400);
  check("unknown language rejected (400)", (await entry({ locale: "xx", key: "hero.description", value: "x" })).status === 400);
  check("text longer than 10000 chars rejected (400)", (await entry({ locale: "fr", key: "hero.description", value: "x".repeat(10001) })).status === 400);
  check("client cannot edit texts (403)", (await entry({ locale: "fr", key: "hero.description", value: "x" }, client)).status === 403);
  check("anonymous cannot edit texts (401)", (await entry({ locale: "fr", key: "hero.description", value: "x" }, new Client())).status === 401);
  check("site can be framed by itself only (editor preview)", (await fetch(B)).headers.get("x-frame-options") === "SAMEORIGIN" && /frame-ancestors 'self'/.test((await fetch(B)).headers.get("content-security-policy") ?? ""));

  // --- legal pages, consent, abuse protection ---
  for (const [path, needle] of [["/conditions-generales", "Conditions générales de vente"], ["/confidentialite", "Politique de confidentialité"], ["/mentions-legales", "Mentions légales"]] as const) {
    const fr = await html(path, "site_locale=fr");
    check(`${path} renders in French`, fr.status === 200 && fr.text.includes(needle), String(fr.status));
    check(`${path} shows the firm's contact email`, fr.text.includes("contact@makramarfaoui.com"));
  }
  check("terms page in Arabic (rtl)", (await html("/conditions-generales", "site_locale=ar")).text.includes("الشروط العامة للبيع"));
  check("privacy page in English", (await html("/confidentialite", "site_locale=en")).text.includes("Privacy policy"));
  check("legal notice in Italian", (await html("/mentions-legales", "site_locale=it")).text.includes("Note legali"));
  page = await html("/", "site_locale=en");
  check("footer links to the three legal pages", ["/mentions-legales", "/conditions-generales", "/confidentialite"].every((href) => page.text.includes(`href="${href}"`)));
  check("legal pages listed in sitemap", (await (await fetch(`${B}/sitemap.xml`)).text()).includes("/conditions-generales"));

  const anonJson = async (extra: Record<string, unknown>) => {
    const c = new Client();
    const email = `consent.${stamp}.${Math.random().toString(36).slice(2, 8)}@test.local`;
    const res = await c.req("/api/auth/sign-up/email", { method: "POST", json: { name: "Consent Test", email, password: "Passw0rd!Long", firstName: "Consent", lastName: "Test", ...extra } });
    return { res, email };
  };
  let su = await anonJson({});
  check("sign-up without consent rejected (400)", su.res.status === 400, String(su.res.status));
  su = await anonJson({ termsAccepted: false });
  check("sign-up with consent=false rejected (400)", su.res.status === 400, String(su.res.status));
  su = await anonJson({ termsAccepted: true, website: "http://spam.example" });
  check("honeypot filled -> rejected (400)", su.res.status === 400, String(su.res.status));
  check("no account created by rejected sign-ups", (await prisma.user.count({ where: { email: su.email } })) === 0);
  su = await anonJson({ termsAccepted: true, website: "" });
  check("sign-up with consent accepted (200)", su.res.status === 200, String(su.res.status));
  const consented = await prisma.user.findUnique({ where: { email: su.email } });
  check("consent timestamp stored", !!consented?.termsAcceptedAt && Date.now() - consented.termsAcceptedAt.getTime() < 60_000);

  const big = new Blob([new Uint8Array(22 * 1024 * 1024)]);
  const bigForm = form(base);
  bigForm.set("file", big, "huge.pdf");
  r = await client.req("/api/orders", { method: "POST", body: bigForm });
  check("oversized upload rejected before parsing (413)", r.status === 413, String(r.status));

  // Per-IP API limit: hammer a cheap endpoint until it answers 429
  let limited = 0;
  for (let i = 0; i < 80; i++) {
    const x = await fetch(`${B}/api/locale`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.77" }, body: JSON.stringify({ locale: "fr" }) });
    if (x.status === 429) { limited = i + 1; break; }
  }
  check("locale endpoint rate-limited per IP (429 after 60/min)", limited > 0 && limited <= 62, String(limited));
  const one = await fetch(`${B}/api/locale`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.99" }, body: JSON.stringify({ locale: "fr" }) });
  check("another IP is unaffected", one.status === 200, String(one.status));

  // Login throttling (keep last: it blocks sign-in from this IP for about a minute)
  const victim = `victim.${stamp}@test.local`;
  let sawLimit = 0;
  for (let i = 1; i <= 25; i++) {
    const attempt = await new Client().login(victim, "wrong-password-1");
    if (attempt === 429) { sawLimit = i; break; }
  }
  check("repeated failed logins get throttled (429)", sawLimit > 0 && sawLimit <= 16, String(sawLimit));

  console.log(`\n${pass} passed, ${fail} failed`);
}
main().catch((e) => { console.error("ERROR", e); fail++; }).finally(async () => { await prisma.$disconnect(); process.exit(fail ? 1 : 0); });
