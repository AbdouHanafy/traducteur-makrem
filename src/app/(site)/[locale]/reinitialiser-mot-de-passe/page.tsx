import { Suspense } from "react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ResetPasswordPage from "@/views/ResetPasswordPage";

export const metadata: Metadata = buildMetadata({ title: "Nouveau mot de passe", path: "/reinitialiser-mot-de-passe", noIndex: true });

export default function Page() {
  return <Suspense><ResetPasswordPage /></Suspense>;
}
