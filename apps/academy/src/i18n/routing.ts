import { defineRouting } from "next-intl/routing";

export const locales = ["ca", "es", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ca",
  // Català sense prefix (/), castellà a /es i anglès a /en
  localePrefix: "as-needed",
});
