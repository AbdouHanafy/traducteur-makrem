"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useI18n } from "@/views/components/I18nProvider";

export default function LogoutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        })
      }
      className={variant === "sidebar" ? "text-[12px] font-medium text-slate-400 hover:text-white" : "text-[13.5px] font-semibold text-muted hover:text-navy"}
    >
      {t("app.shell.logout")}
    </button>
  );
}
