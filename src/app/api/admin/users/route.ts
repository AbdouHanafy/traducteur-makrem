import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { createUserSchema } from "@/schemas/user";
import { createUser, findUserByEmail } from "@/repositories/users";

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cette adresse email." }, { status: 409 });
  }

  const user = await createUser(parsed.data);
  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
}
