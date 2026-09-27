import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrderSchema } from "@/schemas/order";
import { findServiceById } from "@/repositories/services";
import { findPricingRuleByKey } from "@/repositories/pricingRules";
import { createOrderWithSourceDocument } from "@/repositories/orders";
import { computeQuote } from "@/lib/pricing";
import { validateUpload, UploadValidationError } from "@/lib/upload";
import { writePrivateFile } from "@/lib/storage/privateStorage";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = createOrderSchema.safeParse({
    serviceId: formData.get("serviceId"),
    sourceLang: formData.get("sourceLang"),
    targetLang: formData.get("targetLang"),
    pages: formData.get("pages"),
    delayKey: formData.get("delayKey"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Document source requis." }, { status: 400 });
  }

  const service = await findServiceById(parsed.data.serviceId);
  if (!service || !service.active || service.pricePerPage.isZero()) {
    return NextResponse.json({ error: "Service invalide." }, { status: 400 });
  }

  const pricingRule = await findPricingRuleByKey(parsed.data.delayKey);
  if (!pricingRule || !pricingRule.active) {
    return NextResponse.json({ error: "Délai invalide." }, { status: 400 });
  }

  let upload;
  try {
    upload = await validateUpload(file);
  } catch (e) {
    if (e instanceof UploadValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }

  const quote = computeQuote({
    pricePerPage: service.pricePerPage,
    pages: parsed.data.pages,
    delayMultiplier: pricingRule.multiplier,
  });

  const storageKey = await writePrivateFile(upload.buffer, upload.extension);

  const order = await createOrderWithSourceDocument({
    userId: session.user.id,
    serviceId: service.id,
    sourceLang: parsed.data.sourceLang,
    targetLang: parsed.data.targetLang,
    pages: parsed.data.pages,
    delayKey: parsed.data.delayKey,
    totalAmount: quote.totalAmount,
    advanceAmount: quote.advanceAmount,
    balanceAmount: quote.balanceAmount,
    document: {
      storageKey,
      originalName: file.name,
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
      sha256: upload.sha256,
    },
  });

  return NextResponse.json({ id: order.id, reference: order.reference }, { status: 201 });
}
