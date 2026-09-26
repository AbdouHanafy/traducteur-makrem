import { buildMetadata } from "@/lib/seo";
import ContactPage from "@/views/ContactPage";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Téléphone, email et adresse du cabinet de Maître Makram Arfaoui à Tunis.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
