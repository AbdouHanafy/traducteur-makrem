import { buildMetadata } from "@/lib/seo";
import ServicesPage from "@/views/ServicesPage";

export const metadata = buildMetadata({
  title: "Nos services",
  description:
    "Traductions juridiques assermentées : actes d'état civil, diplômes, contrats, documents judiciaires, immigration, interprétariat.",
  path: "/services",
});

export default function Page() {
  return <ServicesPage />;
}
