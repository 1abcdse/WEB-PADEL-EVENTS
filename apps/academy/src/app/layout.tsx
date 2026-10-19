import type { ReactNode } from "react";
import "./globals.css";

// L'<html> el renderitza src/app/[locale]/layout.tsx (amb l'idioma correcte)
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
