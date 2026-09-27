import { buildMetadata } from "@/lib/seo";
import { listActiveFaqs } from "@/repositories/faq";
import FaqPage from "@/views/FaqPage";

export const metadata = buildMetadata({
  title: "Questions fréquentes",
  description:
    "Prix, délais, paiement en deux temps, confidentialité : les réponses aux questions les plus fréquentes sur la traduction assermentée.",
  path: "/faq",
});

export default async function Page() {
  const faqs = await listActiveFaqs();

  return <FaqPage faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))} />;
}
