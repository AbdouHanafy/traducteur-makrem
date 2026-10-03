import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const storageRoot = process.env.PRIVATE_STORAGE_ROOT;
    if (!storageRoot) throw new Error("PRIVATE_STORAGE_ROOT manquant");
    await access(storageRoot, constants.R_OK | constants.W_OK);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      event: "readiness_failed",
      message: error instanceof Error ? error.message : "unknown",
    }));
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
