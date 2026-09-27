import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardShell from "@/views/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <DashboardShell user={session ? { name: session.user.name, email: session.user.email } : null}>
      {children}
    </DashboardShell>
  );
}
