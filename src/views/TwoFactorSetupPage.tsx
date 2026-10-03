"use client";

import { useRouter } from "next/navigation";
import AuthShell from "@/views/components/AuthShell";
import TwoFactorPanel from "@/views/components/TwoFactorPanel";
import LogoutButton from "@/views/components/LogoutButton";
import { useI18n } from "@/views/components/I18nProvider";

export default function TwoFactorSetupPage({ destination, mandatory }: { destination: string; mandatory: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <AuthShell eyebrow={t("login.eyebrow")} title={t("app.mfa.setupTitle")} subtitle={t("app.mfa.setupSubtitle")}>
      <TwoFactorPanel mandatory={mandatory} onEnabled={() => { router.push(destination); router.refresh(); }} />
      <div className="mt-5 text-center"><LogoutButton /></div>
    </AuthShell>
  );
}
