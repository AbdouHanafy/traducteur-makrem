import { buildMetadata } from "@/lib/seo";
import AboutPage from "@/views/AboutPage";

export const metadata = buildMetadata({
  title: "À propos",
  description:
    "Maître Makram Arfaoui, traducteur et interprète assermenté près la Cour d'appel de Tunis.",
  path: "/a-propos",
});

export default function Page() {
  return <AboutPage />;
}
