import type { MetadataRoute } from "next";
import { formatList, packs } from "@/content";
import { locales, routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

const STATIC = [
  "/",
  "/experiencies",
  "/reserva",
  "/com-funciona",
  "/academia",
  "/installacions",
  "/faq",
  "/contacte",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC,
    ...formatList.map((f) => `/experiencies/${f.slug}`),
    ...packs.map((p) => `/experiencies/${p.format}/${p.slug}`),
  ];
  return paths.map((path) => ({
    url: absoluteUrl(path, routing.defaultLocale),
    lastModified: new Date(),
    changeFrequency:
      path === "/" || path.startsWith("/experiencies") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/experiencies") ? 0.9 : 0.6,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, absoluteUrl(path, l)]),
      ),
    },
  }));
}
