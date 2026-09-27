import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listAllTestimonials } from "@/repositories/testimonials";
import AdminTestimonialsPage from "@/views/AdminTestimonialsPage";

export const metadata = buildMetadata({ title: "Avis clients (admin)", path: "/admin/testimonials", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const items = await listAllTestimonials();

  return (
    <AdminTestimonialsPage
      items={items.map((i) => ({
        id: i.id,
        authorName: i.authorName,
        authorRole: i.authorRole ?? "",
        quote: i.quote,
        rating: i.rating,
        active: i.active,
      }))}
    />
  );
}
