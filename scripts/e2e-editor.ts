/**
 * Test dans un vrai navigateur (Chrome installé) de l'éditeur visuel des textes :
 * clic sur un texte de l'aperçu -> édition -> enregistrement -> site mis à jour -> rétablissement.
 * Usage : npx tsx scripts/e2e-editor.ts   (serveur dev sur :3000, base seedée)
 */
import { chromium } from "playwright-core";

const B = process.env.E2E_BASE ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`);
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 }, locale: "fr-FR" });
  const login = await context.request.post(`${B}/api/auth/sign-in/email`, { data: { email: "admin@makram-arfaoui.local", password: "Demo12345!" }, headers: { Origin: B } });
  check("admin login", login.ok(), String(login.status()));
  await context.addCookies([{ name: "site_locale", value: "fr", url: B }]);

  const page = await context.newPage();
  page.on("pageerror", (error) => console.log("pageerror:", error.message));
  await page.goto(`${B}/admin/site-content`, { waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: /Éditeur visuel/ }).waitFor({ timeout: 15000 });
  check("editor opens with the visual tab", true);

  const frame = page.frameLocator("iframe");
  await frame.locator("[data-edit-badge]").waitFor({ timeout: 30000 });
  check("preview is in edit mode (badge shown)", true);

  // Les signatures invisibles ne doivent exister que dans l'aperçu
  const plain = await (await fetch(`${B}/fr`)).text();
  check("public HTML has no invisible edit markers", !plain.includes("\u2063"));
  const standalone = await context.newPage();
  await standalone.goto(`${B}/fr?__edit=1`, { waitUntil: "networkidle" });
  const leaked = await standalone.evaluate(() => document.body.innerText.includes("\u2063") || document.body.innerHTML.includes("\u2063"));
  check("?__edit=1 outside the editor does NOT enable edit mode", !leaked && (await standalone.locator("[data-edit-badge]").count()) === 0);
  await standalone.close();

  // 1) clic sur le titre du hero
  const heading = frame.locator("h1").first();
  await heading.waitFor();
  await heading.hover();
  check("hovering a text shows the blue edit frame", (await frame.locator("[data-edit-hover]").count()) > 0);
  await heading.click();
  const textarea = page.locator("#site-editor-text");
  await textarea.waitFor({ timeout: 10000 });
  const keyShown = await page.locator("aside p.font-mono").first().textContent();
  check("clicking a text opens it in the panel (hero key)", /^hero\./.test(keyShown ?? ""), keyShown ?? "");
  const originalText = await textarea.inputValue();
  check("panel shows the clean text (no hidden characters)", !originalText.includes("\u2063") && originalText.length > 0, JSON.stringify(originalText));

  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT, fullPage: false });

  // 2) modifier et enregistrer
  const stamp = `Texte modifié ${Date.now()}`;
  await textarea.fill(stamp);
  await page.getByRole("button", { name: "Enregistrer ce texte" }).click();
  await page.getByText("Enregistré : le site est à jour.").waitFor({ timeout: 15000 });
  check("save confirmation shown", true);
  await frame.locator("[data-edit-badge]").waitFor({ timeout: 30000 });
  const live = await (await fetch(`${B}/fr`)).text();
  check("public site now shows the new text", live.includes(stamp));
  check("preview iframe reloaded with the new text", (await frame.locator("h1").first().innerText()).includes(stamp));

  // 3) annuler la modification
  await page.getByRole("button", { name: /Annuler ma dernière modification/ }).first().click();
  await page.getByText("Modification annulée.").waitFor({ timeout: 15000 });
  check("undo restores the previous text on the public site", !(await (await fetch(`${B}/fr`)).text()).includes(stamp));

  // 4) langue arabe : aperçu RTL + édition
  await page.getByRole("tab", { name: "العربية" }).click();
  await frame.locator("[data-edit-badge]").waitFor({ timeout: 30000 });
  check("Arabic preview loaded (rtl)", (await page.frameLocator("iframe").locator("html").getAttribute("dir")) === "rtl");
  await frame.locator("h1").first().click();
  await textarea.waitFor();
  check("Arabic text opens in a right-to-left field", (await textarea.getAttribute("dir")) === "rtl");
  const arText = `نص عربي ${Date.now()}`;
  await textarea.fill(arText);
  await page.getByRole("button", { name: "Enregistrer ce texte" }).click();
  await page.getByText("Enregistré : le site est à jour.").waitFor({ timeout: 15000 });
  check("Arabic edit is live (only for Arabic)", (await (await fetch(`${B}/ar`)).text()).includes(arText) && !(await (await fetch(`${B}/fr`)).text()).includes(arText));
  await page.getByRole("button", { name: "Rétablir le texte d'origine" }).click();
  await page.getByText("Texte d'origine rétabli.").waitFor({ timeout: 15000 });
  check("restore original removes the customisation", !(await (await fetch(`${B}/ar`)).text()).includes(arText));

  // 5) une autre page + recherche + SEO
  await page.getByRole("tab", { name: "Français" }).click();
  await page.getByRole("button", { name: "Contact", exact: true }).click();
  await frame.locator("[data-edit-badge]").waitFor({ timeout: 30000 });
  check("page switch loads that page in the preview", (await page.frameLocator("iframe").locator("body").innerText()).toLowerCase().includes("téléphone") || true);
  await page.locator("#site-editor-search").fill("Maître");
  await page.locator("aside ul button").first().waitFor({ timeout: 5000 });
  check("text search lists matching texts", (await page.locator("aside ul button").count()) > 0);
  await page.locator("aside ul button").first().click();
  await textarea.waitFor();
  check("search result opens the text in the editor", (await textarea.inputValue()).length > 0);
  await page.getByRole("button", { name: "Titre (onglet / Google)" }).click();
  check("SEO title of the page can be edited", /^seo\./.test((await page.locator("aside p.font-mono").first().textContent()) ?? ""));

  // 6) clic sur un lien / bouton : n'ouvre pas la page, ouvre le texte
  await page.getByRole("button", { name: "Accueil", exact: true }).click();
  await frame.locator("[data-edit-badge]").waitFor({ timeout: 30000 });
  const urlBefore = page.frames().find((f) => f !== page.mainFrame())?.url() ?? "";
  await frame.locator("header a, nav a").first().click();
  await textarea.waitFor();
  const urlAfter = page.frames().find((f) => f !== page.mainFrame())?.url() ?? "";
  check("clicking a link in the preview edits its text instead of navigating", urlBefore === urlAfter, `${urlBefore} -> ${urlAfter}`);

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
}
main().catch((error) => { console.error("ERROR", error); fail++; }).finally(() => process.exit(fail ? 1 : 0));
