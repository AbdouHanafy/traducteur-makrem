import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/rbac";
import { testimonialSchema } from "@/schemas/testimonial";
import { createTestimonial } from "@/repositories/testimonials";

export async function POST(request: Request) {
  const result = await requireAdminSession();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.error === "unauthenticated" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const testimonial = await createTestimonial({
    ...parsed.data,
    authorRole: parsed.data.authorRole || null,
    rating: parsed.data.rating ?? null,
  });
  return NextResponse.json({ testimonial }, { status: 201 });
}
