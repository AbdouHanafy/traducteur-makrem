import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { Role } from "@prisma/client";

export function listAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
}

/** Crée le compte directement en DB plutôt que via `auth.api.signUpEmail` : cet endpoint
 * pose un cookie de session pour le compte créé (plugin nextCookies) — appelé depuis une
 * route admin, ça déconnecterait l'admin de son propre navigateur et le connecterait comme
 * le nouvel utilisateur. Même hachage argon2id (lib/password.ts) que Better Auth, même ligne
 * Account "credential" que prisma/seed.ts crée pour les comptes pré-Better Auth. */
export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        name: `${input.firstName} ${input.lastName}`,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        role: input.role,
      },
    });

    await tx.account.create({
      data: { userId: user.id, accountId: user.id, providerId: "credential", password: passwordHash },
    });

    return user;
  });
}

export interface UpdateUserProfileInput {
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export function updateUserProfile(id: string, input: UpdateUserProfileInput) {
  return prisma.user.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      name: `${input.firstName} ${input.lastName}`,
      phone: input.phone || null,
      role: input.role,
    },
  });
}

export function countAdmins() {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

export function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
