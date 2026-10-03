import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processEmailOutbox } from "@/lib/email/outbox";

function authorized(request: Request): boolean {
  const configured = process.env.JOBS_SECRET;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || !received) return false;
  const expectedBuffer = Buffer.from(configured);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const result = await processEmailOutbox();
  return NextResponse.json({ ok: true, ...result });
}
