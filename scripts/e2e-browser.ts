/**
 * Parcours du site public dans un vrai navigateur (Chrome installé) : changement de langue sur les
 * URLs préfixées, accessibilité clavier, tunnel de commande rempli via l'interface, mot de passe
 * oublié, et analyse axe-core dans les 4 langues.
 * Usage : npx tsx scripts/e2e-browser.ts   (serveur dev sur :3000, base seedée)
 */
import { chromium, type Page } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { totp } from "./totp";

const B = process.env.E2E_BASE ?? "http://localhost:3000";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra = "") {
  if (ok) pass++; else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  -> " + extra}`);
}

const PDF = (() => {
  const objs = ["<</Type/Catalog/Pages 2 0 R>>", "<</Type/Pages/Kids[3 0 R]/Count 1>>", "<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]/Contents 4 0 R>>", "<</Length 0>>\nstream\n\nendstream"];
  let s = "%PDF-1.4\n"; const off: number[] = [];
  objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") + `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${x}\n%%` + "EOF";
  return Buffer.from(s);
})();

async function lang(page: Page) {
  return page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }));
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const stamp = Date.now();

  // ------------------------------------------------------------------ langue sur URL préfixée
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${B}/fr/services`, { waitUntil: "networkidle" });
    check("prefixed URL /fr/services renders in French", (await lang(page)).lang === "fr");
    await page.getByRole("button", { name: /Langue/ }).first().click();
    await page.getByRole("option", { name: /English/ }).click();
    await page.waitForURL(/\/en\/services/, { timeout: 15000 });
    check("language switch on a prefixed URL changes the URL (/en/services)", /\/en\/services$/.test(page.url()));
    await page.waitForFunction(() => document.documentElement.lang === "en", undefined, { timeout: 15000 });
    check("...and the page language", (await lang(page)).lang === "en");
    await page.getByRole("button", { name: /Language/ }).first().click();
    await page.getByRole("option", { name: /العربية/ }).click();
    await page.waitForURL(/\/ar\/services/, { timeout: 15000 });
    await page.waitForFunction(() => document.documentElement.dir === "rtl", undefined, { timeout: 15000 });
    check("switching to Arabic flips the layout to right-to-left", (await lang(page)).dir === "rtl");
    // l'URL non préfixée fonctionne toujours avec le cookie
    await page.goto(`${B}/services`, { waitUntil: "networkidle" });
    check("unprefixed URL still honours the language cookie", (await lang(page)).lang === "ar");
    await context.close();
  }

  // ------------------------------------------------------------------ clavier : lien d'évitement + menu mobile
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${B}/fr`, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /contenu/i }).first();
    check("first Tab stop is the skip-to-content link", await skip.evaluate((el) => el === document.activeElement));
    check("skip link target exists", (await page.locator("#main-content").count()) === 1);
    await skip.press("Enter");
    check("activating the skip link moves focus into main content", await page.evaluate(() => document.activeElement?.id === "main-content" || !!document.activeElement?.closest("#main-content")));
    await context.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const m = await mobile.newPage();
    await m.goto(`${B}/fr`, { waitUntil: "networkidle" });
    const opener = m.getByRole("button", { name: "Ouvrir le menu" });
    await opener.click();
    const dialog = m.locator("#mobile-navigation");
    await dialog.waitFor();
    check("opening the mobile menu moves focus inside it", await m.evaluate(() => !!document.activeElement?.closest("#mobile-navigation")));
    let stayed = true;
    for (let i = 0; i < 25; i++) { await m.keyboard.press("Tab"); stayed = stayed && (await m.evaluate(() => !!document.activeElement?.closest("#mobile-navigation"))); }
    check("Tab key cycles inside the mobile menu (focus trap)", stayed);
    await m.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" }).catch(() => undefined);
    check("Escape closes the menu and returns focus to its button", await opener.evaluate((el) => el === document.activeElement));
    await mobile.close();
  }

  // ------------------------------------------------------------------ tunnel de commande via l'interface
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await context.newPage();
    const email = `ui.${stamp}@test.local`;
    await page.goto(`${B}/fr/commander`, { waitUntil: "networkidle" });
    await page.locator("form button[type=submit]").click();
    check("submitting an empty order form shows an error instead of sending", (await page.getByRole("alert").count()) > 0 || (await page.locator(":invalid").count()) > 0);

    await page.selectOption("#sourceLang", "ar");
    await page.selectOption("#targetLang", "ar");
    await page.fill("#pages", "2");
    await page.fill("#destinationCountry", "Belgique");
    await page.fill("#receivingAuthority", "Commune de Bruxelles");
    await page.fill("#purpose", "Inscription à l'état civil");
    await page.fill("#fullName", "Sarra Ben Ali");
    await page.fill("#orderEmail", email);
    await page.fill("#orderPhone", "+21622200170");
    await page.fill("#orderPassword", "Passw0rd!Long");
    await page.setInputFiles("input[type=file]", { name: "acte.pdf", mimeType: "application/pdf", buffer: PDF });
    await page.getByRole("checkbox").check();
    await page.locator("form button[type=submit]").click();
    await page.getByRole("alert").first().waitFor({ timeout: 10000 });
    check("same source and target language is refused with a visible alert", /diff|même|langue/i.test((await page.getByRole("alert").first().innerText())));

    await page.selectOption("#targetLang", "fr");
    await page.locator("form button[type=submit]").click();
    await page.waitForURL(/\/dashboard\/orders\/[a-z0-9]+$/, { timeout: 30000 });
    check("valid order creates the account and lands on the order page", /\/dashboard\/orders\//.test(page.url()));
    await page.getByRole("button", { name: /Accepter le devis/ }).waitFor({ timeout: 30000 });
    const body = await page.locator("body").innerText();
    check("order page shows the intake details entered", body.includes("Belgique") && body.includes("Inscription à l'état civil"));
    check("order page offers to accept the quote", /Accepter le devis/.test(body));
    await page.getByRole("button", { name: /Accepter le devis/ }).click();
    await page.getByRole("button", { name: /Payer l'acompte/ }).waitFor({ timeout: 15000 });
    check("accepting the quote reveals the deposit payment button", true);
    await context.close();
  }

  // ------------------------------------------------------------------ mot de passe oublié
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${B}/fr/connexion`, { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await page.goto(`${B}/fr/login`, { waitUntil: "networkidle" });
    const forgot = page.getByRole("link", { name: /oubli/i });
    check("login page links to password recovery", (await forgot.count()) > 0);
    await forgot.first().click();
    await page.waitForURL(/mot-de-passe-oublie/);
    await page.locator("input[type=email]").fill(`nobody.${stamp}@test.local`);
    await page.locator("form button[type=submit]").click();
    await page.getByRole("status").first().waitFor({ timeout: 10000 });
    check("recovery form confirms without revealing whether the account exists", (await page.getByRole("status").first().innerText()).length > 0);
    await context.close();
  }

  // ------------------------------------------------------------------ double authentification via l'interface
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    const page = await context.newPage();
    const email = `ui.mfa.${stamp}@test.local`;
    const password = "Passw0rd!Long";
    await context.request.post(`${B}/api/auth/sign-up/email`, { data: { name: "UI Mfa", email, password, firstName: "UI", lastName: "Mfa", termsAccepted: true }, headers: { Origin: B, "x-forwarded-for": `10.${stamp % 250}.4.4` } });

    await page.goto(`${B}/fr/dashboard/compte`, { waitUntil: "networkidle" }).catch(() => undefined);
    await page.goto(`${B}/dashboard/compte`, { waitUntil: "networkidle" });
    check("account page shows 2FA as disabled", (await page.getByText("Désactivée").count()) > 0);
    await page.locator("#mfa-password").fill(password);
    await page.getByRole("button", { name: "Activer la double authentification" }).click();
    await page.getByRole("img", { name: /QR code/ }).waitFor({ timeout: 15000 });
    check("enrolment shows a scannable QR code", (await page.getByRole("img", { name: /QR code/ }).getAttribute("src"))?.startsWith("data:image/png") === true);
    const secret = (await page.locator("code").first().innerText()).trim();
    check("the manual key is displayed as a fallback", /^[A-Z2-7]{16,}$/.test(secret), secret);
    check("10 backup codes are shown", (await page.locator("ul.font-mono li").count()) === 10);
    await page.locator("#mfa-confirm").fill("000000");
    await page.getByRole("button", { name: "Confirmer et activer" }).click();
    await page.getByRole("alert").filter({ hasText: /incorrect/i }).waitFor({ timeout: 10000 });
    check("a wrong confirmation code shows an error and keeps the setup open", (await page.locator("#mfa-confirm").count()) === 1);
    await page.locator("#mfa-confirm").fill(totp(secret));
    await page.getByRole("button", { name: "Confirmer et activer" }).click();
    await page.getByText("Double authentification activée").waitFor({ timeout: 15000 });
    check("the right code enables 2FA", true);

    // se déconnecter puis se reconnecter : le second facteur est demandé
    await page.getByRole("button", { name: "Se déconnecter" }).first().click();
    await page.waitForURL(`${B}/`, { timeout: 15000 }).catch(() => undefined);
    await page.goto(`${B}/fr/login`, { waitUntil: "networkidle" });
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.locator("form button[type=submit]").click();
    await page.locator("#mfa-code").waitFor({ timeout: 15000 });
    check("after the password, the code screen appears (no session yet)", /vérification/i.test(await page.locator("body").innerText()));
    await page.locator("#mfa-code").fill("000000");
    await page.locator("form button[type=submit]").click();
    await page.getByRole("alert").filter({ hasText: /incorrect/i }).waitFor({ timeout: 10000 });
    check("a wrong code at login shows an error", true);
    await page.locator("#mfa-code").fill(totp(secret));
    await page.locator("form button[type=submit]").click();
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });
    check("the correct code completes the sign-in", /\/dashboard/.test(page.url()));
    await context.close();
  }

  // ------------------------------------------------------------------ axe-core dans les 4 langues
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const targets = ["", "/services", "/faq", "/contact", "/login", "/commander", "/mentions-legales"];
    const seen = new Map<string, Set<string>>();
    for (const locale of ["fr", "ar", "en", "it"]) {
      for (const path of targets) {
        await page.goto(`${B}/${locale}${path}`, { waitUntil: "networkidle" });
        const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        for (const violation of result.violations.filter((v) => v.impact === "critical" || v.impact === "serious")) {
          const where = seen.get(violation.id) ?? new Set<string>();
          where.add(`${locale}${path || "/"}`);
          seen.set(violation.id, where);
        }
      }
    }
    for (const [id, where] of seen) console.log(`   axe ${id}: ${[...where].slice(0, 6).join(", ")}${where.size > 6 ? ` (+${where.size - 6})` : ""}`);
    check("no critical or serious accessibility violations on 7 pages x 4 languages", seen.size === 0, [...seen.keys()].join(", "));
    await context.close();
  }

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
}
main().catch((error) => { console.error("ERROR", error); fail++; }).finally(() => process.exit(fail ? 1 : 0));
