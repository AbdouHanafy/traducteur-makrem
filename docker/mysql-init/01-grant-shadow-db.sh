#!/bin/bash
# Exécuté automatiquement par l'image officielle mysql au premier démarrage
# (docker-entrypoint-initdb.d), uniquement quand le volume de données est vide.
#
# Pourquoi : `prisma migrate dev` a besoin de créer/supprimer une "shadow database"
# temporaire pour détecter les dérives de schéma. L'utilisateur applicatif (MYSQL_USER)
# créé par l'image officielle n'a par défaut de droits que sur MYSQL_DATABASE — pas de
# CREATE/DROP DATABASE. On lui accorde ces droits UNIQUEMENT sur les bases dont le nom
# commence par `prisma_migrate_shadow_db_` (motif généré par Prisma), pas un GRANT ALL
# global : l'utilisateur applicatif reste sans droits sur les autres bases.
# Voir ARCHITECTURE.md §53 (pas de superuser pour l'appli) — ce compromis est spécifique
# au dev local ; la Phase 16 (prod) définira des rôles distincts migration/runtime.
set -euo pipefail

mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  GRANT ALL PRIVILEGES ON \`prisma_migrate_shadow_db_%\`.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
EOSQL
