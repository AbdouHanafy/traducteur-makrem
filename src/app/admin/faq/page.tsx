import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { listAllFaqs } from "@/repositories/faq";
import AdminFaqPage from "@/views/AdminFaqPage";

export const metadata = buildMetadata({ title: "FAQ (admin)", path: "/admin/faq", noIndex: true });

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") redirect("/admin/orders");

  const items = await listAllFaqs();

  return (
    <AdminFaqPage
      items={items.map((i) => ({ id: i.id, question: i.question, answer: i.answer, active: i.active }))}
    />
  );
}
