# Makram Arfaoui — Three-Juror Project Audit and Action Plan

**Audit date:** 3 October 2026  
**Scope:** product/UX, engineering/Next.js, security/privacy, SEO, and production operations  
**Decision:** **NO-GO for production payments or real confidential client documents until the P0 launch gates below are complete.**

## Executive verdict

This is already a strong, coherent MVP—not a simple portfolio. It includes a multilingual public site (FR/AR/EN/IT), RTL support, authentication, an order and quote journey, 50/50 payment flow, protected file delivery, a client dashboard, and an extensive admin/CMS area.

The architecture should be hardened incrementally, not rewritten. The highest-value work is now the operational trust layer: real payments, transactional email and account recovery, secure durable file handling, finalized legal information, automated releases, monitoring, and correct multilingual SEO.

### Jury scores

| Juror | Area | Score / verdict |
|---|---|---|
| Juror 1 | Product, UX, accessibility, conversion | Product implementation **7/10**; launch readiness **4/10** |
| Juror 2 | Engineering, Next.js, testing, maintainability | Strong MVP; **NO-GO** until production controls exist |
| Juror 3 | Security, privacy, SEO, deployment | Security foundation **7/10**; privacy/legal **4/10**; SEO **5/10**; operations **3/10** |

### Verified baseline

- `npm run lint`: **passes**.
- `npm run build`: **passes** with Next.js 16.3.5.
- The build emits repeated Better Auth default-secret errors because local `AUTH_SECRET` is empty. This must become a clean, explicit configuration failure in production/CI rather than noisy library warnings.
- The installed Next.js 16.3.5 documentation was consulted before assessing Proxy, caching, Server/Client Components, metadata, data security, testing, and deployment conventions.

## Implementation status (updated after verification, 3 October 2026)

Legend: ✅ built **and** covered by an automated test · 🟡 built, needs an external service/decision to be complete · ⬜ not started.

| # | Item | Status | Notes |
|---|---|---|---|
| P0-1 | Real payment provider | ✅ code · 🟡 live | Konnect init + server-to-server webhook verification, one active payment per order/phase (DB unique key), replay-safe, expiry reconciliation (late payments honoured). Tested against a fake Konnect (`npm run test:payments`, 35 checks). Needs merchant account + sandbox rehearsal; refunds/reconciliation reports not built. |
| P0-2 | E-mail + account lifecycle | ✅ code · 🟡 live | Transactional outbox (same DB transaction), forgot/reset password, optional e-mail verification, admin 2FA (TOTP, backup codes, lockout, enforced on pages **and** APIs). Needs an e-mail provider and a cron calling `/api/internal/jobs/email-outbox`. Session/device listing not built. |
| P0-3 | Durable, scanned, recoverable documents | 🟡 | Fail-closed malware adapter exists (dev: skipped). Needs the scanning service, object storage/encryption, backups + restore drill, retention purge. Not started: quarantine state machine (`SCANNING`). |
| P0-4 | Legal / privacy / identity | 🟡 | Texts are editable templates; the lawyer must validate them and supply the registration number, host, retention periods. Purge job and data-subject workflow not built. |
| P0-5 | Production env validation | ✅ | `npm run env:check`; production requires Konnect, HTTPS URL, e-mail, scanner, `REQUIRE_ADMIN_2FA`. |
| P0-6 | Tests + CI | ✅ code · 🟡 first run | Five suites (API/business rules, Konnect, 2FA, Chrome editor, Chrome public site + axe) and a production-cache suite; CI workflow written but not yet run on GitHub. No unit-test runner (the suites are integration/e2e). |
| P0-7 | Observability | 🟡 | Health probes, structured error log, `onRequestError`. Needs an error-tracking/APM account and alert rules. |
| P1-8 | Order intake fields | ✅ | Plus **quote adjustment** by the admin with reason, audit and client e-mail; the client can only accept the amount they saw (race-tested). |
| P1-9 | Wizard honesty / drafts | 🟡 | Checklist instead of fake steps; no save-and-resume. |
| P1-10 | Service CMS consistency | 🟡 | **Delay coefficients are now editable** (`/admin/pricing`). Check the nav/service-card dynamic data still needs a manual review. |
| P1-11 | Accessibility | ✅ | Skip link, focus trap, labels; axe-core finds no serious/critical issue on 7 pages × 4 languages; default palette meets WCAG AA. Manual screen-reader/RTL testing still recommended. |
| P1-12 | Multilingual SEO | 🟡 | Locale-prefixed canonicals, hreflang, sitemap, JSON-LD, OG image. Language switch and cookie now follow prefixed URLs. Domain/`metadataBase` still the placeholder. |
| P1-13 | Admin mutations / CSP / audit | 🟡 | Failed saves are now reported (no silent success). CSP is still partial (no nonces); audit coverage is partial (payments, downloads, pricing, quotes). |
| P1-14 | Concurrency | ✅ | Conditional writes on payments, quote accept/adjust. |
| P1-15..18 | Server components, trust, content, docs | ⬜/🟡 | README + ARCHITECTURE refreshed; the rest not started. |

Bugs found and fixed while verifying the first pass: the seed command broke on `server-only`; a stale pending payment could block an order for good; `/opengraph-image` was rewritten to a 404; the language switcher did nothing on `/fr/…` URLs and the browser language overrode the URL language; a write-skew let a client accept an adjusted quote unseen; failed admin saves looked successful; footer/success colours failed WCAG AA.

## What is already good and should be kept

- Server-side role and ownership checks exist in layouts, APIs, and document access—not only in Proxy (`src/lib/rbac.ts`, protected layouts, and download route).
- Translated files remain inaccessible until the balance and matching successful payment are verified.
- Payment confirmation is transactional and idempotent (`src/repositories/payments.ts`).
- Uploads use magic-byte MIME detection, file-size limits, SHA-256 hashes, random storage keys, and path-containment checks.
- Passwords use Argon2; public signup cannot assign its own role; auth endpoints have throttling and a honeypot.
- The public funnel from service discovery to order is clear.
- Real multilingual/RTL rendering is implemented, including `lang` and `dir`.
- Services, articles, FAQ, testimonials, partners, theme, site copy, and homepage sections are admin-editable.
- The project correctly avoids fake testimonials and fake partners.

---

## P0 — Required before production launch

These are release gates. Do not accept real payments or confidential documents until every item is complete.

### 1. Add a real payment provider

**Why:** `src/lib/payments/start.ts` imports only the mock provider, and `src/lib/payments/mock.ts` deliberately throws in production.

Add:

- A real Tunisian provider selected with the business owner (for example Konnect or Flouci).
- Provider-native webhook signature verification over the raw request body.
- Timestamp/replay protection and unique provider event IDs.
- Verification of event type, provider status, amount, currency, order, and payment phase.
- Provider idempotency keys and a database-enforced strategy preventing concurrent duplicate pending payments.
- Explicit failure, expiry, cancellation, refund, and reconciliation states.
- Retry/dead-letter handling and an admin view/action for failed events.
- Sanitized webhook records; never store unnecessary secrets or full sensitive payloads.

**Done when:** advance and balance payments work in sandbox and production-like staging; duplicate/reordered webhooks are harmless; concurrent payment clicks do not create multiple chargeable sessions; reconciliation detects mismatches.

### 2. Add transactional email and complete the account lifecycle

**Why:** clients currently have to poll the dashboard, and a client who forgets a password may lose access to paid documents. SMTP variables exist, but no notification service exists.

Add:

- Email verification.
- Forgot-password and reset-password pages and delivery.
- Emails for order received, quote ready, quote accepted, payment success/failure, translation ready, balance due, download ready, cancellation, and refund.
- An outbox/queue with retry, delivery status, and deduplication so business transactions do not depend on an SMTP call succeeding inline.
- Admin alerts for new orders, failed payments, and delivery failures.
- Session/device listing and revocation.
- MFA or passkeys for admin accounts, plus re-authentication for sensitive actions.

**Evidence:** `.env.example` contains unused SMTP settings; `src/views/LoginPage.tsx` has no recovery path; `src/lib/auth.ts` only anticipates rate limits for reset endpoints.

**Done when:** email verification and password recovery work end to end; every critical order transition produces exactly one retryable notification; admin MFA is required.

### 3. Make document storage durable, encrypted, scanned, and recoverable

**Why:** private documents and public media currently use local disk. That is unsafe on ephemeral/serverless hosts and incomplete for confidential legal documents. `DocumentStatus.SCANNING` exists but is not used.

Add:

- A quarantine → malware scan/CDR → `READY` or `REJECTED` pipeline.
- Scan files before PDF/image preview processing.
- Isolated, resource-limited preview generation with time, memory, page-count, and complexity caps.
- Streaming/body limits enforced at the trusted reverse proxy; do not rely only on `Content-Length` before `request.formData()`.
- Encrypted private object storage, or a rigorously managed encrypted persistent volume for a confirmed single-VPS deployment.
- Storage quotas, orphan cleanup, disk/capacity alerts, and multi-instance semantics.
- Encrypted database and document backups with a scheduled, recorded restore drill.
- A disaster-recovery runbook with recovery-time and recovery-point targets.

**Evidence:** `src/lib/storage/privateStorage.ts`, `src/lib/storage/publicStorage.ts`, `src/lib/pdf-preview.ts`, `src/lib/rate-limit.ts`, and `prisma/schema.prisma`.

**Done when:** unscanned files cannot be parsed or downloaded; a clean file moves to `READY`; malicious/oversized/complex files are rejected safely; a documented backup is restored successfully in staging.

### 4. Finalize legal, privacy, retention, and professional identity

**Why:** the current legal content is explicitly a starter template. The registration field is empty, hosting disclosure is incomplete, and the privacy copy promises deletion without an implemented purge workflow.

Business/legal decisions required:

- Confirm the professional registration/reference number and how the sworn-translator status can be verified.
- Confirm legal business identity, full publisher details, hosting provider, governing terms, refunds/cancellations, complaints, and delivery conditions.
- Define retention periods separately for source files, translated files, accounts, orders, invoices/payments, security logs, and audit logs.
- Define legal holds, deletion/anonymization rules, data-subject request handling, processors, breach response, and cross-border storage rules.
- Obtain review from a qualified Tunisian professional before publication.

Implementation required:

- Scheduled purge/anonymization job with auditable outcomes.
- Admin workflow for access/correction/deletion requests and legal holds.
- Professional portrait, experience, languages, credential/reference details, and a factual verification explanation on the About page.
- A clear physical-delivery policy: signed/stamped original versus digital copy, pickup/courier, geography, turnaround, and fees.

**Evidence:** `src/lib/i18n-legal.ts`, `src/views/AboutPage.tsx`, and the open decisions in `README.md`/`ARCHITECTURE.md`.

**Done when:** approved legal copy is published in every supported language; retention rules are implemented and tested; professional claims are verifiable and contain no invented proof.

### 5. Add strict production configuration validation

**Why:** the build currently produces repeated default-secret warnings. The canonical domain is still marked TODO, while payment, SMTP, and webhook values are blank in the example configuration.

Add one typed server-side environment schema that validates at startup/preflight:

- Production database URL.
- A strong auth secret.
- HTTPS canonical/base URLs with no localhost fallback.
- Storage configuration and encryption requirements.
- Real payment provider keys and webhook secret.
- SMTP/email provider configuration.
- No mock provider, demo credentials, placeholder prices, or placeholder legal fields in production.

Keep secrets out of build output, client bundles, logs, and committed files. Add `server-only` imports to Prisma, auth, repositories, private storage, payment modules, and other server-only DAL code.

**Evidence:** `src/lib/auth.ts`, `src/lib/seo.ts`, `.env.example`, and the current build warning.

**Done when:** a deployment preflight fails once with a useful list of missing/invalid values; a valid production-like configuration builds and starts without Better Auth secret warnings.

### 6. Add a real automated test suite and CI/CD release gate

**Why:** the existing E2E scripts are valuable but ad hoc. There is no test-runner configuration, isolated test database, coverage, application Dockerfile, or CI pipeline.

Add:

- Unit tests for schemas, pricing, state transitions, localization helpers, and authorization rules.
- Integration tests for authentication, IDOR, upload rejection/scanning, payment idempotency/concurrency, order transitions, retention, and email outbox behavior.
- Playwright test runner/config with managed app/database lifecycle and accessibility smoke checks in FR/AR/EN/IT.
- An isolated disposable test database; tests must not mutate development or production data.
- CI stages: clean install → Prisma validate/generate → lint → typecheck → unit/integration/E2E → production build.
- A pinned Node runtime and reproducible deployment artifact (application Dockerfile or equivalent).
- `prisma migrate deploy` for releases, with migration and rollback/runbook checks; do not use `prisma migrate dev` in production.
- Staging deployment, approval gate, rollback procedure, and post-deploy smoke test.
- Custom `not-found.tsx`, route `error.tsx`, and `global-error.tsx` fallbacks.

**Evidence:** `package.json`, `scripts/e2e.ts`, `scripts/e2e-editor.ts`, and absence of CI configuration.

**Done when:** a clean CI environment provisions its own database and passes all gates; a deliberately broken ownership/payment invariant fails CI; staging can be deployed and rolled back from a documented procedure.

### 7. Add observability, health checks, and incident response

**Why:** there is no application instrumentation, structured production logging, error monitoring, health/readiness route, metrics, or operational alerting.

Add:

- Next.js instrumentation and exception/APM monitoring.
- Structured logs with request/correlation IDs and strict PII/document/payment redaction.
- Liveness and readiness checks covering app, database, storage, email queue, and payment dependencies as appropriate.
- Alerts for error rate, failed webhooks, stuck jobs, failed notifications, low storage, backup failures, and anomalous auth activity.
- Payment reconciliation, queue health, backup status, and restore-test status.
- Incident, breach, outage, and payment-dispute runbooks with owners.

**Done when:** a staged exception, failed webhook, failed backup, and dependency outage each produce a useful alert without leaking document contents, cookies, passwords, or raw payment data.

---

## P1 — Required for a credible public launch

### 8. Collect the real information needed to fulfill an order

The current order captures service, languages, pages, deadline, and file. Add:

- Destination country and receiving authority.
- Intended purpose/use.
- Certification, legalization, apostille, or special-format needs.
- Client notes and reference.
- Delivery format and method (digital, pickup, courier/postal).
- Delivery address and delivery fees when applicable.
- Explicit confirmation of document legibility and page count.
- Admin quote override/adjustment with reason, audit entry, and client re-acceptance.

Update the Prisma model, validation schema, quote snapshot, admin detail, client detail, and notification templates together.

### 9. Make the order wizard honest and resilient

The UI displays three steps while permanently highlighting the first and rendering one long form (`src/views/OrderWizardPage.tsx`). Either implement real progressive steps or replace the indicator with a simple checklist.

Also add:

- Draft/save-and-resume behavior for mobile uploads.
- Inline field errors and focus on the first invalid field.
- Clear upload progress, cancellation, retry, and scan status.
- Protection against accidental navigation after selecting/uploading a file.

### 10. Fix service CMS consistency

- Remove the hard-coded five-service content override in `src/views/components/ServiceCard.tsx` so database translations remain authoritative.
- Make `src/views/components/Topbar.tsx` load active services dynamically; newly created services must appear where expected.
- Add admin CRUD for `PricingRule` multipliers instead of relying on seed data.
- Replace placeholder production prices and define who can change them.
- Audit every editable CMS value for cache invalidation and locale fallback behavior.

### 11. Complete accessibility

- Add a skip-to-content link and stable main-content target.
- Trap focus inside the mobile navigation dialog and restore it to the trigger when closed.
- Give login/register and mutation errors accessible live/alert semantics.
- Give the file input an explicit label/ID and associate help/error text using `aria-describedby`.
- Localize testimonial labels and controls currently hard-coded in French.
- Increase very small 10–11 px informational text where readability suffers.
- Add automated axe checks plus manual keyboard and screen-reader tests, especially for Arabic RTL.
- Review image alternative text and add a meaningful FAQ empty state.

**Evidence:** `src/views/components/Topbar.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `FileDropzone.tsx`, `TestimonialsCarousel.tsx`, `FaqPage.tsx`, and article views.

### 12. Fix multilingual SEO architecture

The current Proxy selects language by cookie/`Accept-Language`, while every locale emits the same unprefixed canonical and the sitemap lists only unprefixed URLs. Search engines cannot reliably discover four independent language versions.

Choose and document one strategy:

1. **Recommended:** indexable locale-prefixed URLs (`/fr/...`, `/ar/...`, `/en/...`, `/it/...`) with redirects from unprefixed URLs; self-canonical URLs; `hreflang`/`alternates.languages` plus `x-default`; every locale/article variant in the sitemap.
2. If only French should rank, intentionally canonicalize/noindex the other variants and state that limitation.

Also add:

- A confirmed production domain and `metadataBase`.
- 1200×630 branded Open Graph/Twitter images and article-specific images where available.
- Correct locale/alternate-locale metadata and Twitter card metadata.
- Factual JSON-LD: appropriate `ProfessionalService`/`LocalBusiness`, `Person`, `WebSite`, `BreadcrumbList`, `Article`, and FAQ only for visible content.
- Search Console/Bing verification, sitemap submission, redirects for changed article slugs, and monitoring.

**Evidence:** `src/proxy.ts`, `src/lib/seo.ts`, `src/lib/page-metadata.ts`, and `src/app/sitemap.ts`.

### 13. Harden admin mutations, rate limits, CSP, and auditing

- Do not close dialogs or show success when an admin API response is not `ok`; add pending, disabled, error, retry, and conflict states.
- Move production rate limiting to Redis/database/provider storage before multiple app instances; configure the trusted edge proxy to overwrite forwarding headers.
- Expand immutable audit events to user/role changes, auth/security events, document actions, order status changes, content/legal/theme changes, exports, and deletion/purge actions.
- Roll out a nonce/hash CSP in Report-Only, inventory payment/font/image/connect/frame requirements, then enforce it. Avoid a blanket `unsafe-inline`/`unsafe-eval` fix.
- Confirm HSTS only when HTTPS is permanent on the domain and every relevant subdomain; do not submit preload prematurely.

**Evidence:** `src/lib/rate-limit.ts`, `next.config.ts`, `prisma/schema.prisma`, admin views, payment and download audit writes.

### 14. Improve error handling and payment/order concurrency

- Add accessible expected-error UI and safe retry behavior across public and admin mutations.
- Enforce valid order transitions in one domain/state-machine layer instead of scattering assumptions across routes.
- Add database/idempotency protection for find-then-create payment races.
- Add optimistic concurrency or conflict detection where two admins can update the same order/content.
- Preserve a financial snapshot and append-only history for every manual adjustment.

### 15. Reduce unnecessary client-side JavaScript

Many mostly static public views are client components because the whole site is wrapped in a client i18n provider, which imports site, app, and admin dictionaries for all four languages.

Refactor gradually:

- Render static page copy in Server Components with a locale-scoped dictionary.
- Pass translated strings/data into small interactive client islands.
- Keep only genuinely interactive elements client-side: navigation toggle, language switcher, carousel, editor overlay, and forms.
- Measure bundles, Core Web Vitals, and hydration before and after.
- Replace public `<img>` elements with `next/image` where it provides measured responsive-size/CLS value and works with the media model.

Do **not** enable `cacheComponents` as an unrelated optimization; the project currently follows the valid previous caching model for installed Next.js 16.

### 16. Improve trust and contact conversion

- Add verified office hours, map/directions, and separate links for each phone number.
- Add WhatsApp only if it is genuinely monitored and operational expectations are clear.
- Add verified, consented case examples organized by document type and destination authority without exposing client information.
- Never make unverifiable claims such as “100% accepted.”

### 17. Improve article/content quality

- Add author/reviewer, publish/update dates, headings, lists, internal links, and topic-specific calls to action.
- Add content governance: legal review date, reviewer, testimonial consent/source, and credential verification date.
- Add FAQ/article search only when content volume justifies it.
- Build future content from real search/customer demand rather than generic volume.

### 18. Update documentation and repository hygiene

- Rewrite `README.md` and the current-status sections of `ARCHITECTURE.md`; they contradict implemented features and still describe completed areas as “coming later” or placeholders.
- Document current capabilities, limitations, setup, testing, deployment, migrations, rollback, backups, restore, retention, and incident response.
- Add an architecture decision record for hosting/storage, payments, locale URL strategy, notifications, and background jobs.
- Remove or document unrelated repository artifacts such as `Capture d'écran 2026-10-03 105820.png` after confirming it is not needed.

---

## P2 — Add after launch, based on measured need

- Privacy-respecting funnel analytics: service viewed → order started → upload completed → account created → order submitted → quote accepted → payments completed. If non-essential cookies are introduced, update policy and obtain consent first.
- Client notification preferences; SMS/WhatsApp only with explicit consent and a reliable operator.
- Background queues for email, previews, reconciliation, purge, and other retryable jobs.
- Pagination/filtering for growing admin users, media, orders, articles, and audit logs.
- Database indexes chosen from production query telemetry rather than guesswork.
- Storage/audit/payment operations dashboards.
- Fine-grained cache tags only after measuring whether broad revalidation is a real bottleneck.
- Dependency/vulnerability scanning, scheduled patching, browser matrix, service-level objectives, and regular restore/security exercises.

---

## Explicitly avoid

- Fake testimonials, partners, credentials, case counts, ratings, or review structured data.
- Production deployment with the mock payment provider, known demo password, blank secrets, localhost URLs, placeholder prices, or unfinished legal text.
- Ephemeral/serverless local disk for private client documents.
- Treating Proxy or layout redirects as authorization; keep checks at each data/API boundary.
- Serving private documents from `public/`, using obscurity as access control, or exposing previews before balance payment.
- Parsing untrusted documents before scanning/isolation.
- Logging document contents, auth cookies, passwords, full payment payloads, or unnecessary personal data.
- Intrusive chat popups, autoplay carousels, fake urgency/countdowns, or an unrestricted page builder.
- A cookie banner when there are no non-essential cookies; conversely, never add analytics/ads/heatmaps silently.
- A wholesale rewrite of the working repository/schema/RBAC architecture.

---

## Recommended implementation order

### Milestone A — Production foundation

1. Decide hosting, private storage, payment provider, email provider, canonical domain, retention rules, and legal owner.
2. Add typed environment preflight and server-only boundaries.
3. Add CI, isolated tests, staging, migrations, deployment artifact, and rollback.
4. Add durable encrypted storage, scanning, backups, and restore verification.
5. Add observability, health/readiness, alerts, and runbooks.

### Milestone B — Complete the commercial workflow

1. Integrate real payments and webhook/reconciliation handling.
2. Add email verification, password reset, notification outbox, and admin MFA.
3. Expand order intake/delivery fields and implement real wizard steps/drafts.
4. Add admin pricing-rule/quote adjustment controls with history and audit.
5. Finalize legal copy, retention automation, professional identity, and delivery policy.

### Milestone C — Public launch quality

1. Fix locale URLs, canonicals, hreflang, sitemap, social metadata, and factual structured data.
2. Complete the accessibility list and multilingual manual testing.
3. Fix service CMS consistency, contact conversion, article structure, and error states.
4. Reduce client boundaries and measure performance.
5. Run the full launch checklist and a restore/payment/security drill.

## Final launch gate

Launch only when all of the following are true:

- [ ] Real payment succeeds and duplicate/replayed webhooks are safe.
- [ ] Password recovery, email verification, notifications, and admin MFA work.
- [ ] Every client file is quarantined, scanned, privately stored, retained, and deleted according to approved rules.
- [ ] Encrypted backups have been restored successfully in a drill.
- [ ] Legal, privacy, refund, hosting, professional-registration, and physical-delivery information is approved and published.
- [ ] No mock/demo/placeholder configuration can start in production.
- [ ] CI passes lint, typecheck, tests, security-critical scenarios, and production build.
- [ ] Staging deployment, migrations, rollback, health checks, monitoring, and alerts are verified.
- [ ] Locale URL/canonical/hreflang/sitemap strategy is correct and tested.
- [ ] Keyboard, screen-reader, mobile, RTL, and payment/order flows pass acceptance testing.
- [ ] Incident, breach, backup, payment dispute, and recovery responsibilities have named owners.

When these checks pass, the existing MVP is a credible foundation for production. Until then, the safest and highest-return strategy is to complete these controls instead of adding more decorative pages or features.
