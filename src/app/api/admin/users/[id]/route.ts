import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { updateUserSchema } from "@/schemas/user";
import { findUserById, updateUserProfile, deleteUser, countAdmins } from "@/repositories/users";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findUserById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Un admin ne doit pas pouvoir se retirer son propre accès admin depuis cet écran — ça
  // laisserait le backoffice sans administrateur si c'est le dernier compte ADMIN.
  if (id === result.session.user.id && parsed.data.role !== existing.role) {
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle." }, { status: 400 });
  }

  if (existing.role === "ADMIN" && parsed.data.role !== "ADMIN" && (await countAdmins()) <= 1) {
    return NextResponse.json({ error: "Il doit rester au moins un administrateur." }, { status: 409 });
  }

  const user = await updateUserProfile(id, parsed.data);
  return NextResponse.json({ user: { id: user.id, role: user.role } });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findUserById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  if (id === result.session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  // Order.userId n'a pas de cascade (ARCHITECTURE.md — l'historique des commandes ne doit
  // jamais disparaître silencieusement) : un utilisateur avec des commandes ne peut pas être
  // supprimé, seulement désactivé côté rôle si besoin.
  if (existing._count.orders > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer un utilisateur ayant des commandes." },
      { status: 409 },
    );
  }

  if (existing.role === "ADMIN" && (await countAdmins()) <= 1) {
    return NextResponse.json({ error: "Il doit rester au moins un administrateur." }, { status: 409 });
  }

  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
