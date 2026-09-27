import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import LoginPage from "@/views/LoginPage";

export const metadata = buildMetadata({
  title: "Connexion",
  path: "/login",
  noIndex: true,
});

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
