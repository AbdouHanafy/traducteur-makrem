# Maître Makram Arfaoui — Plateforme de traduction juridique

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour l'analyse du prototype, l'architecture cible et le
plan d'implémentation complet. La maquette d'origine est archivée dans
[`reference/original-prototype.html`](reference/original-prototype.html).

**État actuel : Phase 2 (fondation MySQL/Prisma) terminée.** Homepage statique (Phase 1) +
base MySQL locale via Docker, migration initiale appliquée, seed de démonstration, CRUD
vérifié réellement contre la base. Aucune authentification, aucun paiement encore branchés.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6.19.3 (MySQL 8.0, Docker) —
conventions alignées sur le projet calmatrip (page/view split, repositories, schemas Zod à
venir).

## Démarrage local

```bash
cp .env.example .env    # puis remplacer les mots de passe MYSQL_* par de vraies valeurs locales
npm install
npm run db:up            # démarre MySQL (Docker), attend qu'il soit healthy
npm run db:migrate        # applique les migrations Prisma
npm run db:seed           # crée 3 comptes de démo + les services
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
```

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

## Prochaines phases

Voir la table des phases dans ARCHITECTURE.md §8 — la suite est l'authentification
(NextAuth v5 + argon2id, Phase 3), qui adaptera `prisma/seed.ts` pour définir de vrais mots
de passe de démo hachés.
