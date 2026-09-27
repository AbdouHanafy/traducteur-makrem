import { buildMetadata } from "@/lib/seo";
import { listActiveServices } from "@/repositories/services";
import OrderWizardPage from "@/views/OrderWizardPage";

export const metadata = buildMetadata({
  title: "Commander une traduction",
  path: "/commander",
  noIndex: true,
});

export default async function Page() {
  const services = await listActiveServices();
  const orderable = services
    .filter((s) => !s.pricePerPage.isZero())
    .map((s) => ({ id: s.id, name: s.name, pricePerPage: s.pricePerPage.toString() }));

  return <OrderWizardPage services={orderable} />;
}
