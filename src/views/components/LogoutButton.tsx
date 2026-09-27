"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function LogoutButton() {
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
      className="text-[13.5px] font-semibold text-muted hover:text-navy"
    >
      Se déconnecter
    </button>
  );
}
