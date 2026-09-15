import { buildMetadata, SITE } from "@/lib/seo";
import HomePage from "@/views/HomePage";

export const metadata = buildMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
