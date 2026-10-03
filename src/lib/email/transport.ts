import "server-only";

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Transport HTTP provider-agnostic. EMAIL_API_URL doit accepter un POST JSON contenant
 * from/to/subject/html/text avec un Bearer token. Un adaptateur SMTP peut être ajouté sans
 * modifier l'outbox. En développement, EMAIL_DELIVERY_MODE=log n'affiche que destinataire/sujet.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.EMAIL_DELIVERY_MODE === "log" && process.env.NODE_ENV !== "production") {
    console.info("[email:dev]", { to: message.to, subject: message.subject });
    return;
  }

  const endpoint = process.env.EMAIL_API_URL?.trim();
  const apiKey = process.env.EMAIL_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim();
  if (!endpoint || !apiKey || !from) throw new Error("Transport email non configuré (EMAIL_API_URL, EMAIL_API_KEY, EMAIL_FROM)." );
  const url = new URL(endpoint);
  if (url.protocol !== "https:") throw new Error("EMAIL_API_URL doit utiliser HTTPS.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: message.to, subject: message.subject, html: message.html, text: message.text }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Le provider email a répondu ${response.status}.`);
  } finally {
    clearTimeout(timeout);
  }
}
