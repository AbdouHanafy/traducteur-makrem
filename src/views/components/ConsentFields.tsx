"use client";

import Link from "next/link";
import { useI18n } from "@/views/components/I18nProvider";

/**
 * Case de consentement (CGV + politique de confidentialité) et champ piège anti-robot.
 * Le champ `website` est invisible et hors tabulation : un humain ne le remplit jamais,
 * un robot qui remplit tous les champs se fait rejeter côté serveur (voir src/lib/auth.ts).
 */
export default function ConsentFields({ accepted, onAcceptedChange, honeypot, onHoneypotChange }: {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  honeypot: string;
  onHoneypotChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => onHoneypotChange(event.target.value)} />
        </label>
      </div>
      <label className="flex items-start gap-3 text-[13px] leading-5 text-ink">
        <input type="checkbox" required checked={accepted} onChange={(event) => onAcceptedChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {t("legal.consent.prefix")}{" "}
          <Link href="/conditions-generales" target="_blank" className="font-semibold text-blue hover:text-blue-2">{t("legal.consent.terms")}</Link>{" "}
          {t("legal.consent.and")}{" "}
          <Link href="/confidentialite" target="_blank" className="font-semibold text-blue hover:text-blue-2">{t("legal.consent.privacy")}</Link>.
        </span>
      </label>
    </>
  );
}
