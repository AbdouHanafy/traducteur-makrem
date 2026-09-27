# Maître Makram Arfaoui — Plateforme de traduction juridique

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour l'analyse du prototype, l'architecture cible et le
plan d'implémentation complet. La maquette d'origine est archivée dans
[`reference/original-prototype.html`](reference/original-prototype.html).

**État actuel : le parcours complet fonctionne, de la commande au fichier débloqué.** Pages
publiques, authentification (Better Auth), wizard de commande (`/commander`), devis auto,
paiement 50/50 via un provider mock (vrai aller-retour serveur, pas de simulation frontend),
verrouillage total du fichier traduit tant que le solde n'est pas confirmé, et un espace
traducteur minimal (`/admin/orders`) pour déposer le fichier final. Testé de bout en bout avec
Playwright, y compris les cas IDOR (un tiers ne peut ni voir ni télécharger la commande d'un
autre). Ce qui manque encore : CRUD admin pour les prix, KPI dashboard, notifications email,
provider de paiement réel.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6.19.3 (MySQL 8.0, Docker) ·
Better Auth (email/mot de passe, argon2id via `@node-rs/argon2`) · `pdfjs-dist` +
`@napi-rs/canvas` (aperçus filigranés, voir ARCHITECTURE.md §5.1) · `file-type` (validation MIME
réelle des uploads) — conventions alignées sur le projet calmatrip (page/view split,
repositories, schemas Zod à venir).

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
npm run db:up         # docker compose up -d (MySQL)
npm run db:down       # docker compose down
npm run db:logs       # logs du conteneur MySQL
npm run db:migrate    # prisma migrate dev
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
  repositories/   (à venir Phase 3+) seule couche autorisée à toucher Prisma
  schemas/        (à venir) validation Zod
  lib/            prisma.ts, seo.ts, et futurs payments/, storage/, notifications.ts
prisma/
  schema.prisma   modèle de données (voir ARCHITECTURE.md §4)
  migrations/     historique des migrations Prisma
  seed.ts         3 comptes de démo (mot de passe non défini, voir Phase 3) + services
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

## Comptes de démo (dev uniquement)

`npm run db:seed` crée 3 comptes via le vrai flux Better Auth (mot de passe : `Demo1234!`) :
`admin@makram-arfaoui.local` (ADMIN — assure aussi la traduction) et
`client-demo@makram-arfaoui.local` (CLIENT).

## Prochaines phases

Voir la table des phases dans ARCHITECTURE.md §8 — la suite logique est le wizard de commande
(Phase 4) et le CRUD services/pricing admin (Phase 3), `/dashboard` n'étant pour l'instant
qu'un placeholder qui prouve que la session fonctionne.
