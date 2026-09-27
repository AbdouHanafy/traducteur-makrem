import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { updateUserRoleSchema } from "@/schemas/user";
import { findUserById, updateUserRole } from "@/repositories/users";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findUserById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Un admin ne doit pas pouvoir se retirer son propre accès admin depuis cet écran — ça
  // laisserait le backoffice sans administrateur si c'est le dernier compte ADMIN.
  if (id === result.session.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle." }, { status: 400 });
  }

  const user = await updateUserRole(id, parsed.data.role);
  return NextResponse.json({ user: { id: user.id, role: user.role } });
}
