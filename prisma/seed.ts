/**
 * Seed de développement.
 *
 * Les comptes de démo passent par `auth.api.signUpEmail` (Better Auth — voir src/lib/auth.ts)
 * pour créer le couple User+Account exactement comme le ferait un vrai visiteur : le mot de
 * passe est haché en argon2id (src/lib/password.ts) par le même chemin que la vraie
 * inscription. `role` est ensuite élevé directement en DB pour admin/traducteur — Better Auth
 * refuse de le fixer via le payload public (voir `input: false` dans src/lib/auth.ts).
 *
 * Ce script est idempotent : si le compte existe déjà, on se contente de réaligner son mot
 * de passe et son rôle plutôt que de re-créer.
 */
import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const DEV_PASSWORD = "Demo1234!";

interface DemoUser {
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "TRANSLATOR" | "CLIENT";
}

const DEMO_USERS: DemoUser[] = [
  { email: "admin@makram-arfaoui.local", firstName: "Makram", lastName: "Arfaoui", role: "ADMIN" },
  { email: "traducteur@makram-arfaoui.local", firstName: "Sami", lastName: "Traducteur", role: "TRANSLATOR" },
  { email: "client-demo@makram-arfaoui.local", firstName: "Sarra", lastName: "Ben Ali", role: "CLIENT" },
];

async function upsertDemoUser(demo: DemoUser) {
  const existing = await prisma.user.findUnique({ where: { email: demo.email } });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: `${demo.firstName} ${demo.lastName}`,
        email: demo.email,
        password: DEV_PASSWORD,
        firstName: demo.firstName,
        lastName: demo.lastName,
      },
    });
  } else {
    const passwordHash = await hashPassword(DEV_PASSWORD);
    const credentialAccount = await prisma.account.findFirst({
      where: { userId: existing.id, providerId: "credential" },
    });

    if (credentialAccount) {
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: passwordHash },
      });
    } else {
      // Compte antérieur à Better Auth (créé avant la Phase 2 bis) : il n'a jamais eu
      // de ligne Account "credential" — on la crée pour qu'il redevienne connectable.
      await prisma.account.create({
        data: {
          userId: existing.id,
          accountId: existing.id,
          providerId: "credential",
          password: passwordHash,
        },
      });
    }
  }

  const user = await prisma.user.update({
    where: { email: demo.email },
    data: { role: demo.role },
  });

  return user;
}

async function main() {
  const users = [];
  for (const demo of DEMO_USERS) {
    users.push(await upsertDemoUser(demo));
  }

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

  // Multiplicateurs de délai — placeholders de dev au même titre que pricePerPage ci-dessus.
  const pricingRules = [
    { key: "delay.standard", label: "Standard (5-7 jours)", multiplier: "1.000" },
    { key: "delay.express", label: "Express (48h)", multiplier: "1.300" },
    { key: "delay.urgent", label: "Urgent (24h)", multiplier: "1.600" },
  ];

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: { key: rule.key },
      update: {},
      create: rule,
    });
  }

  console.log("Seed OK :", {
    users: users.map((u) => `${u.email} (${u.role})`),
    devPassword: DEV_PASSWORD,
    services: services.map((s) => s.slug),
    pricingRules: pricingRules.map((r) => r.key),
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
