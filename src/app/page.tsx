import { buildMetadata, SITE } from "@/lib/seo";
import { listActiveServices } from "@/repositories/services";
import HomePage from "@/views/HomePage";

export const metadata = buildMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
});

export default async function Page() {
  const services = await listActiveServices();

  return (
    <HomePage
      services={services.map((s) => ({ slug: s.slug, name: s.name, description: s.description }))}
    />
  );
}
