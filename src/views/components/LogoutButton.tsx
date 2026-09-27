"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function LogoutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const router = useRouter();

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
      Se déconnecter
    </button>
  );
}
