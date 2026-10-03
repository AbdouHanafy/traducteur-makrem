/**
 * Seed de développement.
 *
 * Les comptes de démo passent par `auth.api.signUpEmail` (Better Auth — voir src/lib/auth.ts)
 * pour créer le couple User+Account exactement comme le ferait un vrai visiteur : le mot de
 * passe est haché en argon2id (src/lib/password.ts) par le même chemin que la vraie
 * inscription. `role` est ensuite élevé directement en DB pour l'admin — Better Auth
 * refuse de le fixer via le payload public (voir `input: false` dans src/lib/auth.ts).
 *
 * Ce script est idempotent : si le compte existe déjà, on se contente de réaligner son mot
 * de passe et son rôle plutôt que de re-créer.
 */
import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";
import { hashPassword } from "../src/lib/password";
import { SEED_ARTICLES } from "./seed-articles";

const prisma = new PrismaClient();

const DEV_PASSWORD = "Demo12345!";

interface DemoUser {
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CLIENT";
}

const DEMO_USERS: DemoUser[] = [
  { email: "admin@makram-arfaoui.local", firstName: "Makram", lastName: "Arfaoui", role: "ADMIN" },
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
        termsAccepted: true,
      } as never,
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

  // FaqItem n'a pas de clé naturelle à upserter dessus (la question peut être reformulée
  // depuis le backoffice) : on ne seed que si la table est vide, pour rester idempotent sans
  // dupliquer à chaque `db seed`.
  const faqCount = await prisma.faqItem.count();
  const faqs = [
    {
      question: "Une traduction assermentée est-elle acceptée par toutes les administrations ?",
      answer:
        "Une traduction assermentée est certifiée conforme à l'original, cachetée et signée par un traducteur assermenté. Elle est reconnue par les administrations tunisiennes, ambassades, universités et tribunaux. En cas de doute sur un dossier précis, l'organisme destinataire reste la référence sur ses propres exigences.",
    },
    {
      question: "Comment le prix est-il calculé ?",
      answer:
        "Le prix dépend du type de document, de la paire de langues, du nombre de pages et du délai souhaité. Aucun prix n'est fixé à l'avance sur le site : un devis exact est communiqué après dépôt du document, avant tout engagement.",
    },
    {
      question: "Comment se déroule le paiement ?",
      answer:
        "Le paiement se fait en deux temps : un acompte de 50 % au lancement de la traduction, puis le solde de 50 % une fois la traduction terminée. Le fichier final est livré verrouillé et se débloque au paiement du solde.",
    },
    {
      question: "Mes documents sont-ils confidentiels ?",
      answer:
        "Oui. Les documents déposés sont des actes personnels et sont traités comme tels : accès restreint, aucune diffusion publique, et suppression selon la politique de conservation du cabinet.",
    },
    {
      question: "Quels formats de fichiers sont acceptés ?",
      answer:
        "Les formats courants sont acceptés : PDF, JPEG, PNG, ainsi que les scans de bonne qualité. Un document illisible peut retarder l'établissement du devis.",
    },
    {
      question: "Combien de temps prend une traduction ?",
      answer:
        "Le délai dépend du volume et de la complexité du document ainsi que du type de délai choisi (standard, express, urgent). Le délai précis est communiqué avec le devis et suivi en ligne depuis votre espace client.",
    },
    {
      question: "Puis-je suivre ma commande en ligne ?",
      answer:
        "Oui, chaque commande dispose d'un espace de suivi indiquant l'étape en cours : devis, acompte, traduction en cours, fichier prêt, solde, téléchargement.",
    },
    {
      question: "Proposez-vous aussi de l'interprétariat ?",
      answer:
        "Oui, pour les mariages mixtes, audiences, actes notariés et rendez-vous administratifs nécessitant un interprète assermenté.",
    },
  ];

  if (faqCount === 0) {
    for (let i = 0; i < faqs.length; i++) {
      await prisma.faqItem.create({ data: { ...faqs[i], order: i } });
    }
  }

  // Articles d'exemple (modifiables dans /admin/articles) — seulement si aucun article n'existe.
  if ((await prisma.article.count()) === 0) {
    for (let i = 0; i < SEED_ARTICLES.length; i++) {
      const { translations, ...article } = SEED_ARTICLES[i];
      await prisma.article.create({
        data: { ...article, translations, order: i, published: true, publishedAt: new Date(Date.now() - (SEED_ARTICLES.length - i) * 86_400_000) },
      });
    }
  }

  // Sections système de la home, dans leur ordre actuel codé en dur (HomePage.tsx avant le
  // page-builder). Même idempotence que FaqItem ci-dessus : seulement si la table est vide.
  const homeSectionCount = await prisma.homeSection.count();
  const systemSections: {
    type: "HERO" | "STATS" | "SERVICES" | "WORKFLOW" | "STATEMENT" | "TESTIMONIALS" | "FINAL_CTA";
  }[] = [
    { type: "HERO" },
    { type: "STATS" },
    { type: "SERVICES" },
    { type: "WORKFLOW" },
    { type: "STATEMENT" },
    { type: "TESTIMONIALS" },
    { type: "FINAL_CTA" },
  ];

  if (homeSectionCount === 0) {
    for (let i = 0; i < systemSections.length; i++) {
      await prisma.homeSection.create({ data: { ...systemSections[i], order: i } });
    }
  } else {
    // Migration douce : une base déjà seedée avant l'ajout du carrousel d'avis n'a pas cette
    // section. On l'insère juste avant FINAL_CTA sans toucher à l'ordre des autres.
    const hasTestimonialsSection = await prisma.homeSection.findFirst({ where: { type: "TESTIMONIALS" } });
    if (!hasTestimonialsSection) {
      const finalCta = await prisma.homeSection.findFirst({ where: { type: "FINAL_CTA" } });
      const order = finalCta ? finalCta.order : (await prisma.homeSection.count());
      if (finalCta) {
        await prisma.homeSection.update({ where: { id: finalCta.id }, data: { order: order + 1 } });
      }
      await prisma.homeSection.create({ data: { type: "TESTIMONIALS", order } });
    }
  }

  console.log("Seed OK :", {
    users: users.map((u) => `${u.email} (${u.role})`),
    devPassword: DEV_PASSWORD,
    services: services.map((s) => s.slug),
    pricingRules: pricingRules.map((r) => r.key),
    faqs: faqCount === 0 ? faqs.length : `déjà présentes (${faqCount})`,
    homeSections: homeSectionCount === 0 ? systemSections.length : `déjà présentes (${homeSectionCount})`,
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
