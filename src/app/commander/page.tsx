import { buildMetadata } from "@/lib/seo";
import { listActiveServices } from "@/repositories/services";
import OrderWizardPage from "@/views/OrderWizardPage";

export const metadata = buildMetadata({
  title: "Commander une traduction",
  path: "/commander",
  noIndex: true,
});

export default async function Page({ searchParams }: PageProps<"/commander">) {
  const { service: requestedService } = await searchParams;
  const services = await listActiveServices();
  const orderable = services
    .filter((s) => !s.pricePerPage.isZero())
    .map((s) => ({ id: s.id, slug: s.slug, name: s.name, pricePerPage: s.pricePerPage.toString() }));
  const requestedSlug = typeof requestedService === "string" ? requestedService : undefined;
  const initialServiceId = orderable.find((service) => service.slug === requestedSlug)?.id;

  return <OrderWizardPage services={orderable} initialServiceId={initialServiceId} />;
}
