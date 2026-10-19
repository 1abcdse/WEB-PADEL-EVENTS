import { site } from "@/content/site";

/** Enllaç wa.me amb un missatge precarregat. */
export function whatsappLink(message: string, number: string = site.whatsapp.primary): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
