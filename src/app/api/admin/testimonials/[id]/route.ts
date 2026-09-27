import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { testimonialSchema } from "@/schemas/testimonial";
import { findTestimonialById, updateTestimonial, deleteTestimonial } from "@/repositories/testimonials";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findTestimonialById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const testimonial = await updateTestimonial(id, {
    ...parsed.data,
    authorRole: parsed.data.authorRole || null,
    rating: parsed.data.rating ?? null,
  });
  return NextResponse.json({ testimonial });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const { id } = await params;
  const existing = await findTestimonialById(id);
  if (!existing) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await deleteTestimonial(id);
  return NextResponse.json({ ok: true });
}
