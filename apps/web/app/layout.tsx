import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lliga Social de Pàdel · CT&P El Masnou",
  description: "Calendari, resultats i classificacions de la Lliga Social de Pàdel del Club Tennis & Pàdel El Masnou.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e4d92" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1320" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
