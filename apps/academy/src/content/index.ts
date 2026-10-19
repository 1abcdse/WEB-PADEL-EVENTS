import { assertValidContent } from "./validate.ts";

// El build (i el servidor de desenvolupament) fallen si algun pack trenca les regles d'hores.
assertValidContent();

export {
  formats,
  formatList,
  isFormatSlug,
  MAX_HOURS_PER_DAY,
} from "./formats.ts";
export { packs, getPack, packsByFormat } from "./packs.ts";
export { dates } from "./dates.ts";
export { extras, extrasById } from "./extras.ts";
export { faqs, faqCategories } from "./faq.ts";
export { team } from "./team.ts";
export { testimonials } from "./testimonials.ts";
export { images } from "./images.ts";
export { site, mapEmbedUrl, mapLinkUrl } from "./site.ts";
export type * from "./types.ts";
export type { ImageKey } from "./images.ts";
