// 404 per a rutes fora de qualsevol idioma
export default function GlobalNotFound() {
  return (
    <html lang="ca">
      <body
        style={{
          background: "#0B0B0B",
          color: "#fff",
          fontFamily: "system-ui",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <main style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "4rem", fontStyle: "italic", margin: 0 }}>
            404
          </h1>
          <p>
            <a href="/" style={{ color: "#D6FF2E" }}>
              Padel System Academy
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
