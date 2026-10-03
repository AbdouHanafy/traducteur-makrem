"use client";

import { useEffect } from "react";

const styles = {
  body: {
    margin: 0,
    background: "#edf0f5",
    color: "#14203a",
    fontFamily: "system-ui, sans-serif",
  },
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    boxSizing: "border-box" as const,
  },
  card: {
    maxWidth: "520px",
    padding: "32px",
    border: "1px solid #dce3ee",
    borderRadius: "16px",
    background: "#ffffff",
    textAlign: "center" as const,
  },
  button: {
    marginTop: "20px",
    border: 0,
    borderRadius: "10px",
    background: "#2456b8",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    padding: "12px 20px",
  },
};

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Root rendering failed", { error, digest: error.digest });
  }, [error]);

  return (
    <html lang="fr">
      <head>
        <title>Erreur | Maitre Makram Arfaoui</title>
      </head>
      <body style={styles.body}>
        <main style={styles.main} role="alert">
          <div style={styles.card}>
            <h1>Le service est momentanément indisponible.</h1>
            <p>Réessayez dans un instant. Aucune action n’a été confirmée par cet écran.</p>
            <button type="button" onClick={() => retry()} style={styles.button}>
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
