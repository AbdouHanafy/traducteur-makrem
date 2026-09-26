import { buildMetadata } from "@/lib/seo";
import FaqPage from "@/views/FaqPage";

export const metadata = buildMetadata({
  title: "Questions fréquentes",
  description:
    "Prix, délais, paiement en deux temps, confidentialité : les réponses aux questions les plus fréquentes sur la traduction assermentée.",
  path: "/faq",
});

export default function Page() {
  return <FaqPage />;
}
