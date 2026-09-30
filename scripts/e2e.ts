import { PrismaClient } from "@prisma/client";
const B = "http://localhost:3000";
const prisma = new PrismaClient();
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`); }

class Client {
  jar = new Map<string, string>();
  async req(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers: Record<string, string> = { Origin: B, ...(init.headers as Record<string, string>) };
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
  const base = { serviceId: service.id, sourceLang: "ar", targetLang: "fr", pages: "3", delayKey: "delay.standard" };
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
  check("webhook disabled with mock provider (404)", (await anon.req("/api/payments/webhook", { method: "POST", json: { providerRef: ref } })).status === 404);
  r = await client.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: ref } });
  check("owner confirms advance", r.status === 200, await r.text());
  r = await client.req("/api/payments/mock/confirm", { method: "POST", json: { providerRef: ref } });
  check("confirm is idempotent", r.status === 200 && (await r.json()).alreadyProcessed === true);
  order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { documents: true } });
  check("status ACOMPTE_PAYE + advancePaid", order.status === "ACOMPTE_PAYE" && order.advancePaid);

  const admin = new Client();
  check("admin login", (await admin.login("admin@makram-arfaoui.local", "Demo1234!")) === 200);
  check("admin /admin = 200", (await admin.req("/admin")).status === 200);
  check("admin /admin/orders = 200", (await admin.req("/admin/orders")).status === 200);
  check("admin /admin/orders/[id] = 200", (await admin.req(`/admin/orders/${orderId}`)).status === 200);
  check("client cannot start translation (403)", (await client.req(`/api/admin/orders/${orderId}/status`, { method: "POST" })).status === 403);
  const upEarly = await admin.req(`/api/admin/orders/${orderId}/document`, { method: "POST", body: form({}, file) });
  check("upload refused before translation started (409)", upEarly.status === 409, String(upEarly.status));
  check("admin starts translation", (await admin.req(`/api/admin/orders/${orderId}/status`, { method: "POST" })).status === 200);
  check("start translation twice refused (409)", (await admin.req(`/api/admin/orders/${orderId}/status`, { method: "POST" })).status === 409);
  const ups = await Promise.all([1, 2].map(() => admin.req(`/api/admin/orders/${orderId}/document`, { method: "POST", body: form({}, { data: pdf(), name: "traduction é.pdf", type: "application/pdf" }) })));
  const upCodes = ups.map((x) => x.status).sort();
  check("concurrent translated upload: exactly one 200", upCodes.filter((c) => c === 200).length === 1, upCodes.join(","));
  const tcount = await prisma.document.count({ where: { orderId, kind: "TRANSLATED" } });
  check("exactly one TRANSLATED document", tcount === 1, String(tcount));
  order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { documents: true } });
  check("status FICHIER_EN_ATTENTE_DE_SOLDE", order.status === "FICHIER_EN_ATTENTE_DE_SOLDE", order.status);
  const tr = order.documents.find((d) => d.kind === "TRANSLATED")!;

  check("client download before balance = 402", (await client.req(`/api/orders/${orderId}/documents/${tr.id}/download`)).status === 402);
  check("client preview = 423 (locked)", (await client.req(`/api/orders/${orderId}/documents/${tr.id}/preview`)).status === 423);
  const pv = await admin.req(`/api/orders/${orderId}/documents/${tr.id}/preview?page=1`);
  check("admin watermark preview (200 jpeg)", pv.status === 200 && pv.headers.get("content-type") === "image/jpeg", String(pv.status));
  check("advance again refused (409)", (await client.req(`/api/orders/${orderId}/payment/advance`, { method: "POST" })).status === 409);
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
