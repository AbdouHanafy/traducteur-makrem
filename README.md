# Maître Makram Arfaoui — Plateforme de traduction juridique

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour l'analyse du prototype, l'architecture cible et le
plan d'implémentation complet. La maquette d'origine est archivée dans
[`reference/original-prototype.html`](reference/original-prototype.html).

**État actuel : le parcours principal est implémenté, de la commande au fichier débloqué.** Il
comprend les pages publiques multilingues, Better Auth, le devis automatique, le paiement 50/50,
le verrouillage du fichier final, le tableau de bord client et le backoffice (commandes, contenus,
utilisateurs, thème et médiathèque). Le provider mock reste réservé au développement ; Konnect est
le provider prévu pour la production. Avant une mise en ligne réelle, il reste notamment à valider
les textes légaux et coordonnées, configurer les secrets et le stockage persistant, brancher les
notifications, ajouter l'analyse antivirus des documents et exécuter la recette de production.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6.19.3 (MySQL 8.0, Docker) ·
Better Auth (email/mot de passe, argon2id via `@node-rs/argon2`) · `pdfjs-dist` +
`@napi-rs/canvas` (aperçus filigranés, voir ARCHITECTURE.md §5.1) · `file-type` (validation MIME
réelle des uploads) — pages fines, repositories serveur et schémas Zod pour les entrées.

## Démarrage local

```bash
cp .env.example .env    # puis remplacer les mots de passe MYSQL_* par de vraies valeurs locales
npm install
npm run db:up            # démarre MySQL (Docker), attend qu'il soit healthy
npm run db:migrate        # applique les migrations Prisma
npm run db:seed           # crée 3 comptes de démo + les services
npm run media:service-covers  # génère les photos de couverture des services (voir plus bas)
npm run dev
```

## Commandes

```bash
npm run dev           # serveur de dev
npm run build         # build de production
npm run lint          # eslint
npm run typecheck     # vérification TypeScript sans émission
npm run check         # lint + typecheck
npm run env:check     # préflight strict des variables de production
npm run db:up         # docker compose up -d (MySQL)
npm run db:down       # docker compose down
npm run db:logs       # logs du conteneur MySQL
npm run db:migrate    # prisma migrate dev
npm run db:deploy     # applique les migrations déjà versionnées en production
npm run db:generate   # prisma generate
npm run db:seed       # prisma db seed (prisma/seed.ts)
npm run db:studio     # prisma studio
npm run media:service-covers  # scripts/generate-service-covers.ts — image de couverture par
                               # service (navy/or, générée, pas une photo) ; les fichiers
                               # vivent dans public/uploads/media/ (gitignored, comme tout
                               # upload de la médiathèque) donc à relancer après un clone/déploy
```

## Avis clients

Le carrousel d'avis (page d'accueil) ne s'affiche que s'il y a au moins un avis **publié**
dans `/admin/testimonials`. Volontairement vide par défaut : n'y saisir que de vrais avis
de clients, jamais de contenu inventé — un faux avis attribué à un client fictif sur un vrai
site professionnel serait trompeur.

`postinstall` exécute `prisma generate` automatiquement. `npx tsx scripts/verify-db.ts` est
un smoke-test CRUD ponctuel (Phase 2) — pas un script npm permanent, à lancer manuellement si
besoin de revérifier que Prisma écrit/lit réellement dans MySQL.

## Structure

```text
src/
  app/            routes App Router — pages fines, metadata via buildMetadata()
  views/          logique UI (composants + assemblage de page)
  repositories/   couche serveur d'accès à Prisma (`server-only`)
  schemas/        validation Zod des entrées HTTP et formulaires
  lib/            authentification, paiements, stockage, cache, i18n et utilitaires
prisma/
  schema.prisma   modèle de données (voir ARCHITECTURE.md §4)
  migrations/     historique des migrations Prisma
  seed.ts         comptes et données de démonstration pour le développement local
docker/
  mysql-init/     script exécuté au 1er démarrage du conteneur (droits shadow DB Prisma)
docker-compose.yml  MySQL local, lié à 127.0.0.1 uniquement, volume persistant
```

## Sécurité de la base locale

- MySQL n'écoute que sur `127.0.0.1` (voir `docker-compose.yml`), jamais exposé au réseau.
- `DATABASE_URL` et les identifiants MySQL ne vivent que dans `.env` (jamais commité —
  `.gitignore` ignore tout `.env*` sauf `.env.example`).
- L'utilisateur applicatif (`MYSQL_USER`) n'a de droits élargis (création de base) que sur
  les bases `prisma_migrate_shadow_db_*` utilisées par `prisma migrate dev` — pas un accès
  superuser généralisé (voir `docker/mysql-init/01-grant-shadow-db.sh`).
- Prisma n'est importé que côté serveur (`src/lib/prisma.ts`) ; aucun composant client ne le
  touche.

## Rendu, langues et cache

- Le site public vit sous `src/app/(site)/[locale]` : une page **statique par langue** (fr, ar, en,
  it), générée à la demande puis mise en cache. `src/proxy.ts` choisit la langue (cookie
  `site_locale`, puis `Accept-Language`) et **réécrit** `/services` → `/fr/services` en interne :
  les URLs visibles ne changent pas.
- Les espaces connectés (`(app)` : `/admin`, `/dashboard`, `/paiement`) restent rendus à la demande.
- Toute modification faite depuis le backoffice appelle `revalidateSite()` (`src/lib/cache.ts`).
  Le chemin doit contenir le nom du groupe de routes : `revalidatePath("/(site)/[locale]", "layout")`.
  Sans `(site)`, l'invalidation est silencieusement sans effet.
- Textes de l'interface : `src/lib/i18n.ts` (site), `i18n-app.ts` (espace client),
  `i18n-admin.ts` (backoffice) — format `[fr, ar, en, it]` par clé.
- Contenu éditable (services, articles, FAQ, avis, sections libres) : champs en français + colonne
  JSON `translations` (ar/en/it) ; un champ vide retombe sur le français.
- Textes du site (`/admin/site-content`) : **éditeur visuel** — aperçu de la vraie page dans une iframe
  (`?__edit=1`, même origine uniquement), chaque texte porte une signature invisible (`src/lib/i18n-edit.ts`) ;
  un clic ouvre le texte à modifier. Enregistrement texte par texte (`PATCH /api/admin/site-content/entry`).
  Test navigateur : `npm run test:editor` (Chrome installé + serveur dev).
- Apparence (`/admin/theme`) : 26 couleurs, palettes, polices latines + arabes + 2 polices `.woff2` téléversées,
  arrondi des coins, largeur et espacement, politique de lisibilité (WCAG) appliquée aussi côté serveur.
  Les fichiers téléversés sont servis par `src/app/uploads/[...path]` (Next ne sert `public/` que pour les
  fichiers présents au démarrage).
- Tests bout en bout : démarrer MySQL, appliquer les migrations, seed puis lancer le serveur dans
  un terminal séparé avant `npm run test:e2e`. L'éditeur visuel se vérifie avec
  `npm run test:editor`. Le cache se vérifie sur un serveur de production local avec
  `E2E_BASE=http://localhost:3001 npm run test:cache` après `next build` et
  `next start -p 3001`. Ces scripts modifient la base ciblée : ne jamais les lancer contre la
  production.

## Pages légales et protection contre les abus

- Pages `/conditions-generales`, `/confidentialite`, `/mentions-legales` (4 langues), textes dans
  `src/lib/i18n-legal.ts`, **éditables** depuis `/admin/site-content` (groupe « Pages légales »).
  Ce sont des modèles de départ : à faire valider par le cabinet (durées de conservation, remboursement,
  numéro d'inscription à renseigner dans `legal.notice.registration`, hébergeur).
- L'inscription exige la case de consentement (vérifié côté serveur) et horodate `User.termsAcceptedAt`.
- Limites : Better Auth (`src/lib/auth.ts`) sur connexion/inscription/mot de passe + plafond par email
  à la connexion + champ piège anti-robot ; `src/lib/rate-limit.ts` sur commandes, paiements, téléchargements,
  envois de fichiers (corps refusé avant lecture si trop gros) et changement de langue.
- Limiteur **en mémoire** : correct pour une seule instance. Le reverse proxy doit écraser
  `X-Forwarded-For`. Avec plusieurs instances, passer à Redis/base de données.

## Comptes de démo (dev uniquement)

`npm run db:seed` crée 3 comptes via le vrai flux Better Auth (mot de passe : `Demo12345!`) :
`admin@makram-arfaoui.local` (ADMIN — assure aussi la traduction) et
`client-demo@makram-arfaoui.local` (CLIENT).

## Déploiement et exploitation

Avant chaque déploiement :

```bash
npm ci
npm run check
npm run build
npm run env:check
npm run db:deploy
```

`env:check` refuse notamment un secret d'authentification trop court, une URL publique non HTTPS,
le provider mock et une configuration Konnect incomplète. Il ne contacte ni la base ni Konnect.
Les secrets restent dans le gestionnaire de secrets de l'hébergeur, jamais dans Git.

Le stockage `PRIVATE_STORAGE_ROOT` doit être un volume persistant hors du webroot, sauvegardé et
restaurable. Une sauvegarde n'est considérée valide qu'après un test de restauration. Les fichiers
de `public/uploads/` sont eux aussi créés à l'exécution et doivent être persistés ou externalisés.
Après déploiement, vérifier au minimum : connexion, création d'une commande de recette, contrôle
d'accès à un document, initialisation/confirmation d'un paiement de test autorisé et téléchargement
du fichier débloqué. En cas d'échec, restaurer la version applicative précédente ; ne revenir sur une
migration qu'avec une procédure SQL revue et une sauvegarde récente.

La CI GitHub exécute la validation Prisma, ESLint, TypeScript et le build. Les tests E2E nécessitent
encore une base isolée et un serveur lancé explicitement ; ils ne sont donc pas présentés comme un
test unitaire autonome.

## Travaux restants avant production

- analyse antivirus avec quarantaine avant de marquer un document `READY` ;
- notifications email et suivi des échecs ;
- validation juridique finale des pages légales et des coordonnées publiques ;
- recette Konnect avec le compte marchand réel, rapprochement et procédure de remboursement ;
- supervision, alertes, sauvegardes et exercice de restauration du stockage privé.
