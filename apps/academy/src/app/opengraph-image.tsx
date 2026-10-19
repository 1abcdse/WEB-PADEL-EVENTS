import { ImageResponse } from "next/og";

export const alt =
  "Padel System Academy — 20h en un cap de setmana · 30h en 4 dies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imatge Open Graph generada amb la marca (es pot substituir per /public/og.jpg) */
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0B0B0B",
        padding: 72,
        borderBottom: "18px solid #D6FF2E",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div
          style={{
            display: "flex",
            background: "#FFFFFF",
            color: "#0B0B0B",
            fontSize: 64,
            fontWeight: 900,
            fontStyle: "italic",
            padding: "4px 26px",
            transform: "skewX(-12deg)",
          }}
        >
          PS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#FFFFFF",
            fontSize: 26,
            letterSpacing: 8,
          }}
        >
          <span>PADEL SYSTEM</span>
          <span>ACADEMY</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          color: "#FFFFFF",
          fontSize: 84,
          fontWeight: 900,
          fontStyle: "italic",
          lineHeight: 0.95,
          textTransform: "uppercase",
        }}
      >
        <span>Entrena com un pro.</span>
        <span style={{ color: "#D6FF2E" }}>Viu-ho com una experiència.</span>
      </div>
      <div style={{ display: "flex", gap: 48, color: "#ECECE7", fontSize: 30 }}>
        <span>20h · cap de setmana</span>
        <span>30h · stage 4 dies</span>
        <span>Tot inclòs</span>
      </div>
    </div>,
    size,
  );
}
