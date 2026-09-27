import { prisma } from "@/lib/prisma";

export function listPublishedArticles() {
  return prisma.article.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}

export function listAllArticles() {
  return prisma.article.findMany({ orderBy: { order: "asc" } });
}

export function findArticleById(id: string) {
  return prisma.article.findUnique({ where: { id } });
}

export function findPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({ where: { slug, published: true } });
}

export function findArticleBySlug(slug: string) {
  return prisma.article.findUnique({ where: { slug } });
}

export interface ArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string | null;
  published: boolean;
}

export async function createArticle(data: ArticleInput) {
  const last = await prisma.article.findFirst({ orderBy: { order: "desc" } });
  return prisma.article.create({
    data: {
      ...data,
      order: (last?.order ?? -1) + 1,
      publishedAt: data.published ? new Date() : null,
    },
  });
}

export async function updateArticle(id: string, data: ArticleInput) {
  const existing = await prisma.article.findUnique({ where: { id } });
  const becomingPublished = data.published && !existing?.published;

  return prisma.article.update({
    where: { id },
    data: {
      ...data,
      // Ne fixe publishedAt qu'au premier passage en publié — jamais recalculé ensuite,
      // même mentalité que le snapshot financier des commandes (pas de recalcul rétroactif).
      ...(becomingPublished ? { publishedAt: new Date() } : {}),
    },
  });
}

export function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}

/** Même mécanique que FaqItem#moveFaq / HomeSection#moveHomeSection. */
export async function moveArticle(id: string, direction: "up" | "down") {
  const items = await prisma.article.findMany({ orderBy: { order: "asc" } });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return;

  const current = items[index];
  const swap = items[swapIndex];

  await prisma.$transaction([
    prisma.article.update({ where: { id: current.id }, data: { order: swap.order } }),
    prisma.article.update({ where: { id: swap.id }, data: { order: current.order } }),
  ]);
}
