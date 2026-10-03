import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ForgotPasswordPage from "@/views/ForgotPasswordPage";

export const metadata: Metadata = buildMetadata({ title: "Mot de passe oublié", path: "/mot-de-passe-oublie", noIndex: true });

export default function Page() {
  return <ForgotPasswordPage />;
}
