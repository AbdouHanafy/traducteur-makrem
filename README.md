# Maître Makram Arfaoui — Plateforme de traduction juridique

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour l'analyse du prototype, l'architecture cible et le
plan d'implémentation complet. La maquette d'origine est archivée dans
[`reference/original-prototype.html`](reference/original-prototype.html).

**État actuel : Phase 1 (scaffold) terminée.** Homepage statique (topbar, hero, services,
workflow, footer) reprenant l'identité visuelle du prototype ; schéma Prisma de référence en
place ; aucune donnée dynamique, auth ou paiement encore branchés.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Prisma (MySQL) — conventions alignées
sur le projet calmatrip (page/view split, repositories, schemas Zod à venir).

## Commandes

```bash
npm run dev          # serveur de dev
npm run build         # build de production
npm run lint          # eslint
npm run db:push        # prisma db push (sync du schéma sans migration)
npm run db:studio     # prisma studio
```

Copier `.env.example` vers `.env` et renseigner `DATABASE_URL` (MySQL) avant de lancer
`db:push`. `postinstall` exécute `prisma generate` automatiquement.

## Structure

```text
src/
  app/            routes App Router — pages fines, metadata via buildMetadata()
  views/          logique UI (composants + assemblage de page)
  repositories/   (à venir Phase 3+) seule couche autorisée à toucher Prisma
  schemas/        (à venir) validation Zod
  lib/            prisma.ts, seo.ts, et futurs payments/, storage/, notifications.ts
prisma/
  schema.prisma   modèle de données cible (voir ARCHITECTURE.md §4)
```

## Prochaines phases

Voir la table des phases dans ARCHITECTURE.md §8 — la suite est l'authentification
(NextAuth v5 + argon2id, Phase 2), puis les services/tarifs administrables (Phase 3).
