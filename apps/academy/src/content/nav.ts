import { FORMATS } from "./packs";

/** Enllaços del menú principal. La clau és la del namespace "nav" dels missatges. */
export const NAV_LINKS = [
  { key: "howItWorks", href: "/com-funciona" },
  { key: "academy", href: "/academia" },
  { key: "facilities", href: "/installacions" },
  { key: "faq", href: "/faq" },
] as const;

/** Submenú d'Experiències: els dos formats + la comparativa. */
export const EXPERIENCE_LINKS = [
  { format: "weekend", href: `/experiencies/${FORMATS.weekend.slug}` },
  { format: "stage", href: `/experiencies/${FORMATS.stage.slug}` },
] as const;

export const BOOK_HREF = "/reserva";
