/**
 * Seed de développement — Phase 2 (DB foundation only, PAS d'authentification).
 *
 * IMPORTANT — mots de passe :
 * `User.passwordHash` est volontairement laissé à `null` pour ces comptes de démo.
 * Il n'y a pas encore de mécanisme de hachage (argon2id) dans le projet : le créer ici
 * reviendrait soit à stocker un mot de passe en clair sous un nom trompeur, soit à
 * inventer un faux hash. Aucune des deux options n'est acceptable, même en dev.
 * → Phase 3 (Authentication) ajoutera le hachage réel et adaptera ce seed pour définir
 *   un mot de passe utilisable sur ces 3 comptes.
 *
 * Ce script est idempotent (upsert par clé unique) : `npx prisma db seed` peut être
 * relancé sans dupliquer les données.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@makram-arfaoui.local" },
    update: {},
    create: {
      email: "admin@makram-arfaoui.local",
      firstName: "Makram",
      lastName: "Arfaoui",
      role: "ADMIN",
      passwordHash: null,
    },
  });

  const translator = await prisma.user.upsert({
    where: { email: "traducteur@makram-arfaoui.local" },
    update: {},
    create: {
      email: "traducteur@makram-arfaoui.local",
      firstName: "Sami",
      lastName: "Traducteur",
      role: "TRANSLATOR",
      passwordHash: null,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client-demo@makram-arfaoui.local" },
    update: {},
    create: {
      email: "client-demo@makram-arfaoui.local",
      firstName: "Sarra",
      lastName: "Ben Ali",
      role: "CLIENT",
      passwordHash: null,
    },
  });

  // Prix placeholders de développement uniquement — 0 = "sur devis" (même convention que
  // le prototype pour l'interprétariat). La vraie politique tarifaire sera définie avec
  // Maître Arfaoui au moment de construire le système de devis (Phase 5), pas ici.
  const services = [
    {
      slug: "etat-civil",
      name: "Actes d'état civil",
      description: "Extraits de naissance, mariage, décès, livret de famille.",
      pricePerPage: "25.000",
    },
    {
      slug: "diplomes-releves",
      name: "Diplômes & relevés de notes",
      description: "Diplômes, attestations, relevés de notes pour études à l'étranger.",
      pricePerPage: "30.000",
    },
    {
      slug: "contrats-actes",
      name: "Contrats & actes",
      description: "Contrats commerciaux, statuts, procurations, actes notariés.",
      pricePerPage: "35.000",
    },
    {
      slug: "documents-judiciaires",
      name: "Documents judiciaires",
      description: "Jugements, assignations, PV, décisions de tribunaux.",
      pricePerPage: "40.000",
    },
    {
      slug: "interpretariat",
      name: "Interprétariat",
      description: "Interprète assermenté : mariages, tribunaux, notaires, rendez-vous.",
      pricePerPage: "0.000",
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log("Seed OK :", {
    users: [admin.email, translator.email, client.email],
    services: services.map((s) => s.slug),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
