import { buildMetadata } from "@/lib/seo";
import RegisterPage from "@/views/RegisterPage";

export const metadata = buildMetadata({
  title: "Créer un compte",
  path: "/register",
  noIndex: true,
});

export default function Page() {
  return <RegisterPage />;
}
