import { ImageResponse } from "next/og";

export const alt = "Maître Makram Arfaoui — Traducteur et interprète assermenté à Tunis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 76px",
        color: "white",
        background: "linear-gradient(135deg, #0c1a34 0%, #14284d 62%, #2456b8 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            border: "2px solid #b4894e",
            borderRadius: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e8c98f",
            fontSize: 29,
            fontWeight: 700,
          }}
        >
          MA
        </div>
        <div style={{ color: "#e8c98f", fontSize: 25, letterSpacing: 3, textTransform: "uppercase" }}>
          Traduction juridique certifiée
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>Maître Makram Arfaoui</div>
        <div style={{ maxWidth: 930, color: "#dce6f7", fontSize: 34, lineHeight: 1.25 }}>
          Traducteur et interprète assermenté près la Cour d’appel de Tunis
        </div>
      </div>
      <div style={{ color: "#b8c8e4", fontSize: 24 }}>Français · Arabe · Anglais · Italien</div>
    </div>,
    size,
  );
}
