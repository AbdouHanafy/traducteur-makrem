import { buildMetadata } from "@/lib/seo";
import { listActiveServices } from "@/repositories/services";
import ServicesPage from "@/views/ServicesPage";

export const metadata = buildMetadata({
  title: "Nos services",
  description:
    "Traductions juridiques assermentées : actes d'état civil, diplômes, contrats, documents judiciaires, immigration, interprétariat.",
  path: "/services",
});

export default async function Page() {
  const services = await listActiveServices();

  return (
    <ServicesPage
      services={services.map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
        imageUrl: s.imageUrl,
        pricePerPage: s.pricePerPage.toString(),
      }))}
    />
  );
}
