/**
 * Vérifie sur un serveur de PRODUCTION (`next build && next start -p 3001`) que les pages
 * publiques sont bien mises en cache par langue et que le backoffice les invalide.
 * Usage : E2E_BASE=http://localhost:3001 tsx scripts/e2e-cache.ts
 */
const B = process.env.E2E_BASE ?? "http://localhost:3001";
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`); }

const jar = new Map<string, string>();
async function req(path: string, init: RequestInit & { json?: unknown } = {}) {
  const headers: Record<string, string> = { Origin: B, ...(init.headers as Record<string, string>) };
  if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  let body = init.body;
  if (init.json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(init.json); }
  const res = await fetch(B + path, { ...init, headers, body, redirect: "manual" });
  for (const c of res.headers.getSetCookie()) { const [kv] = c.split(";"); const i = kv.indexOf("="); jar.set(kv.slice(0, i), kv.slice(i + 1)); }
  return res;
}
const settle = () => Promise.resolve(); // l'invalidation est bloquante : la prochaine visite est déjà fraîche
const get = async (path: string, locale: string) => {
  const res = await fetch(B + path, { headers: { cookie: `site_locale=${locale}` } });
  return { res, text: await res.text() };
};

async function main() {
  // Warm the cache, then read again.
  await get("/services", "fr");
  const second = await get("/services", "fr");
  const cacheHeader = second.res.headers.get("x-nextjs-cache");
  check("public page served from cache (HIT)", cacheHeader === "HIT" || /s-maxage/.test(second.res.headers.get("cache-control") ?? ""), `x-nextjs-cache=${cacheHeader} cache-control=${second.res.headers.get("cache-control")}`);
  check("cached page is per-language (FR vs EN)", (await get("/services", "en")).text.includes('lang="en"') && (await get("/services", "fr")).text.includes('lang="fr"'));
  check("unknown language segment is 404", (await fetch(`${B}/xx/services`)).status === 404);

  const login = await req("/api/auth/sign-in/email", { method: "POST", json: { email: "admin@makram-arfaoui.local", password: "Demo12345!" } });
  check("admin login (production)", login.status === 200, String(login.status));

  const stamp = Date.now();
  const slug = `cache-${stamp}`;
  await get("/articles", "fr"); // cache the (empty of this article) list
  const created = await req("/api/admin/articles", { method: "POST", json: { slug, title: `Cache test ${stamp}`, excerpt: "e", body: "b", coverImageUrl: "", published: true } });
  const article = (await created.json()).article;
  check("article created", created.status === 201 && !!article?.id, String(created.status));
  await settle();
  check("cached list refreshed after admin edit (invalidation)", (await get("/articles", "fr")).text.includes(`Cache test ${stamp}`));
  check("new article page reachable", (await get(`/articles/${slug}`, "fr")).res.status === 200);

  const updated = await req(`/api/admin/articles/${article.id}`, { method: "PATCH", json: { slug, title: `Cache test edited ${stamp}`, excerpt: "e", body: "b", coverImageUrl: "", published: true, translations: { en: { title: `Cache EN ${stamp}` } } } });
  check("article updated", updated.status === 200, String(updated.status));
  await settle();
  check("cached detail page refreshed (FR)", (await get(`/articles/${slug}`, "fr")).text.includes(`Cache test edited ${stamp}`));
  check("cached detail page refreshed (EN translation)", (await get(`/articles/${slug}`, "en")).text.includes(`Cache EN ${stamp}`));

  await req("/api/admin/theme", { method: "PUT", json: { values: { blue: "#123456" } } });
  await settle();
  check("theme change reaches cached pages", (await get("/", "fr")).text.includes("--color-blue:#123456") && (await get("/faq", "en")).text.includes("--color-blue:#123456"));
  await req("/api/admin/theme", { method: "PUT", json: { values: {} } });
  await settle();
  check("theme reset reaches cached pages", !(await get("/", "fr")).text.includes("--color-blue:#123456"));

  // Files uploaded at runtime must be served in production (Next only serves public/ files present at startup)
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  const mediaForm = new FormData();
  mediaForm.set("file", new File([new Uint8Array(png)], "runtime.png", { type: "image/png" }));
  const uploaded = await req("/api/admin/media", { method: "POST", body: mediaForm });
  const media = (await uploaded.json()).media;
  const mediaRes = await fetch(`${B}${media.url}`);
  check("image uploaded at runtime is served in production", uploaded.status === 201 && mediaRes.status === 200 && mediaRes.headers.get("content-type") === "image/png", `${mediaRes.status}`);
  await req(`/api/admin/media/${media.id}`, { method: "DELETE" });
  const fontForm = new FormData();
  fontForm.set("slot", "2"); fontForm.set("name", "Runtime font");
  fontForm.set("file", new File([new Uint8Array(Buffer.concat([Buffer.from("wOF2"), Buffer.alloc(256, 3)]))], "r.woff2"));
  const fontUp = await req("/api/admin/fonts", { method: "POST", body: fontForm });
  const fontUrl = (await fontUp.json()).font?.url as string;
  const fontRes = await fetch(`${B}${fontUrl}`);
  check("font uploaded at runtime is served in production", fontUp.status === 201 && fontRes.status === 200 && (fontRes.headers.get("content-type") ?? "").includes("woff2"), `${fontRes.status}`);
  await req("/api/admin/fonts?slot=2", { method: "DELETE" });

  const dashboard = await fetch(`${B}/dashboard`, { redirect: "manual" });
  check("dashboard stays dynamic (redirects anonymous)", dashboard.status === 307);

  await req(`/api/admin/articles/${article.id}`, { method: "DELETE" });
  await settle();
  check("deleted article disappears from cache", (await get(`/articles/${slug}`, "fr")).res.status === 404);
  console.log(`\n${pass} passed, ${fail} failed`);
}
main().catch((e) => { console.error("ERROR", e); fail++; }).finally(() => process.exit(fail ? 1 : 0));
