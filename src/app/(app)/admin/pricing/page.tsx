import { buildMetadata } from "@/lib/seo";
import { listAllPricingRules } from "@/repositories/pricingRules";
import { listAllServices } from "@/repositories/services";
import AdminPricingPage from "@/views/AdminPricingPage";

export const metadata = buildMetadata({ title: "Délais & coefficients (admin)", path: "/admin/pricing", noIndex: true });

export default async function Page() {
  const [rules, services] = await Promise.all([listAllPricingRules(), listAllServices()]);
  const example = services.find((service) => service.active && !service.pricePerPage.isZero());
  return (
    <AdminPricingPage
      rules={rules.map((rule) => ({ key: rule.key, multiplier: rule.multiplier?.toString() ?? "1", active: rule.active }))}
      example={example ? { name: example.name, pricePerPage: example.pricePerPage.toString() } : null}
    />
  );
}
