import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma — même pattern que calmatrip : jamais `new PrismaClient()` ailleurs,
 * toujours `import { prisma } from "@/lib/prisma"`. Le cache sur `globalThis` évite de
 * recréer une connexion à chaque hot-reload en dev.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
