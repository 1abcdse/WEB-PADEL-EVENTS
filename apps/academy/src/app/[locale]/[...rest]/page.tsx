import { notFound } from "next/navigation";

// Qualsevol ruta desconeguda dins d'un idioma mostra el 404 traduït
export default function CatchAll() {
  notFound();
}
