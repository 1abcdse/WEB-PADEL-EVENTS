import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ca", "es", "en"],
  defaultLocale: "ca",
  // El català va sense prefix (/), els altres amb /es i /en
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
