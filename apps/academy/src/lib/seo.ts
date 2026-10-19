import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, routing, type Locale } from "@/i18n/routing";
import { site } from "@/content/site";

export function localizedPath(path: string, locale: string): string {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

export function absoluteUrl(path: string, locale: string): string {
  return `${site.url}${localizedPath(path, locale)}`;
}

const ogLocale: Record<Locale, string> = {
  ca: "ca_ES",
  es: "es_ES",
  en: "en_GB",
};

/** Metadades per pàgina: títol, descripció, canonical, hreflang i Open Graph */
export async function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title?: string;
  description?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const desc = description ?? t("description");
  const languages = Object.fromEntries(
    locales.map((l) => [l, absoluteUrl(path, l)]),
  );
  return {
    title: title ?? { absolute: t("title") },
    description: desc,
    alternates: {
      canonical: absoluteUrl(path, locale),
      languages: {
        ...languages,
        "x-default": absoluteUrl(path, routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: title ? `${title} · ${site.name}` : t("title"),
      description: desc,
      url: absoluteUrl(path, locale),
      locale: ogLocale[locale as Locale] ?? "ca_ES",
    },
    twitter: { card: "summary_large_image" },
  };
}
