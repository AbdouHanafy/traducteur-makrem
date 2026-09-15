/**
 * Script de vérification CRUD temporaire — Phase 2.
 *
 * Preuve réelle que Next.js → Prisma → MySQL fonctionne de bout en bout (pas seulement
 * que `prisma generate` s'exécute sans erreur). Crée un enregistrement de test, le relit,
 * le modifie, le relit à nouveau, puis le supprime — en vérifiant à chaque étape le
 * contenu réellement renvoyé par MySQL.
 *
 * Usage : npx tsx scripts/verify-db.ts
 * Ce script ne fait partie d'aucun script npm permanent ; il sert de smoke-test DB
 * ponctuel (Phase 2) et pourra être retiré ou transformé en test Vitest plus tard.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_SLUG = "__db-verify-temp-service__";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

async function main() {
  console.log("1/4 CREATE — insertion d'un service de test…");
  const created = await prisma.service.create({
    data: {
      slug: TEST_SLUG,
      name: "Service de vérification (temporaire)",
      description: "Créé par scripts/verify-db.ts, sera supprimé à la fin du script.",
      pricePerPage: "12.500",
    },
  });
  assert(created.id, "l'insertion n'a renvoyé aucun id");
  console.log("   → créé avec id =", created.id);

  console.log("2/4 READ — relecture depuis MySQL par id…");
  const read = await prisma.service.findUniqueOrThrow({ where: { id: created.id } });
  assert(read.slug === TEST_SLUG, "le slug relu ne correspond pas à celui inséré");
  // Decimal.toString() normalise la représentation (ex. "12.500" -> "12.5") : on compare
  // la valeur numérique, pas la chaîne brute, pour ne pas confondre un bug réel avec un
  // simple détail de formatage de Prisma.Decimal.
  assert(read.pricePerPage.toNumber() === 12.5, "le prix relu ne correspond pas");
  console.log("   → relu :", read.name, "-", read.pricePerPage.toString(), "DT/page");

  console.log("3/4 UPDATE — modification du prix…");
  const updated = await prisma.service.update({
    where: { id: created.id },
    data: { pricePerPage: "99.000" },
  });
  assert(updated.pricePerPage.toNumber() === 99, "la mise à jour n'a pas été persistée");
  const reread = await prisma.service.findUniqueOrThrow({ where: { id: created.id } });
  assert(
    reread.pricePerPage.toNumber() === 99,
    "la relecture après update ne reflète pas le changement (donc pas réellement persisté)",
  );
  console.log("   → confirmé après relecture :", reread.pricePerPage.toString(), "DT/page");

  console.log("4/4 DELETE — suppression du service de test…");
  await prisma.service.delete({ where: { id: created.id } });
  const afterDelete = await prisma.service.findUnique({ where: { id: created.id } });
  assert(afterDelete === null, "l'enregistrement existe encore après delete");
  console.log("   → confirmé absent après relecture");

  console.log("\n✅ CRUD réel vérifié sur MySQL (create → read → update → read → delete).");
}

main()
  .catch((e) => {
    console.error("\n❌", e.message ?? e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
