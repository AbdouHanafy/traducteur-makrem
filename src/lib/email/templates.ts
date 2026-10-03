import "server-only";

export type EmailTemplate =
  | "VERIFY_EMAIL"
  | "RESET_PASSWORD"
  | "ORDER_RECEIVED"
  | "QUOTE_ACCEPTED"
  | "PAYMENT_CONFIRMED"
  | "TRANSLATION_READY";

type Payload = Record<string, unknown>;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function link(url: unknown, label: string): string {
  const value = String(url ?? "");
  if (!value.startsWith("https://") && !value.startsWith("http://localhost:")) return "";
  return `<p><a href="${escapeHtml(value)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#2456b8;color:#fff;text-decoration:none;font-weight:600">${escapeHtml(label)}</a></p>`;
}

export function renderEmail(template: EmailTemplate, payload: Payload): { subject: string; html: string; text: string } {
  const name = String(payload.name ?? "").trim();
  const greeting = name ? `Bonjour ${name},` : "Bonjour,";
  let subject: string;
  let body: string;
  let text: string;

  switch (template) {
    case "VERIFY_EMAIL":
      subject = "Confirmez votre adresse email";
      body = `<p>${escapeHtml(greeting)}</p><p>Confirmez votre adresse email pour sécuriser votre espace client.</p>${link(payload.url, "Confirmer mon email")}`;
      text = `${greeting}\n\nConfirmez votre adresse email : ${String(payload.url ?? "")}`;
      break;
    case "RESET_PASSWORD":
      subject = "Réinitialisation de votre mot de passe";
      body = `<p>${escapeHtml(greeting)}</p><p>Une demande de réinitialisation a été reçue. Ce lien expire dans une heure.</p>${link(payload.url, "Choisir un nouveau mot de passe")}<p>Ignorez ce message si vous n'êtes pas à l'origine de la demande.</p>`;
      text = `${greeting}\n\nRéinitialisez votre mot de passe (lien valable une heure) : ${String(payload.url ?? "")}\n\nIgnorez ce message si vous n'avez rien demandé.`;
      break;
    case "ORDER_RECEIVED":
      subject = `Commande ${String(payload.reference ?? "")} reçue`;
      body = `<p>${escapeHtml(greeting)}</p><p>Votre demande <strong>${escapeHtml(payload.reference)}</strong> a bien été reçue. Le devis est disponible dans votre espace.</p>${link(payload.url, "Voir ma commande")}`;
      text = `${greeting}\n\nVotre demande ${String(payload.reference ?? "")} a bien été reçue. ${String(payload.url ?? "")}`;
      break;
    case "QUOTE_ACCEPTED":
      subject = `Devis ${String(payload.reference ?? "")} accepté`;
      body = `<p>${escapeHtml(greeting)}</p><p>Votre devis a été accepté. Vous pouvez maintenant régler l'acompte depuis votre espace sécurisé.</p>${link(payload.url, "Régler l'acompte")}`;
      text = `${greeting}\n\nVotre devis a été accepté. Réglez l'acompte : ${String(payload.url ?? "")}`;
      break;
    case "PAYMENT_CONFIRMED":
      subject = `Paiement confirmé — ${String(payload.reference ?? "")}`;
      body = `<p>${escapeHtml(greeting)}</p><p>Le paiement de ${escapeHtml(payload.amount)} TND (${escapeHtml(payload.phase)}) est confirmé.</p>${link(payload.url, "Suivre ma commande")}`;
      text = `${greeting}\n\nPaiement de ${String(payload.amount ?? "")} TND confirmé. ${String(payload.url ?? "")}`;
      break;
    case "TRANSLATION_READY":
      subject = `Traduction prête — ${String(payload.reference ?? "")}`;
      body = `<p>${escapeHtml(greeting)}</p><p>Votre traduction est prête. Le fichier sera téléchargeable après règlement du solde.</p>${link(payload.url, "Voir et régler le solde")}`;
      text = `${greeting}\n\nVotre traduction est prête. ${String(payload.url ?? "")}`;
      break;
  }

  return {
    subject,
    text,
    html: `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;line-height:1.6;color:#17233d;max-width:620px;margin:auto;padding:24px"><h1 style="font-size:21px">Maître Makram Arfaoui</h1>${body}<p style="margin-top:32px;color:#667085;font-size:12px">Message transactionnel relatif à votre compte ou votre commande.</p></body></html>`,
  };
}
