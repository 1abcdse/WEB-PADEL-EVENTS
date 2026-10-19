import { site } from "@/content/site";
import type { Pack } from "@/content/types";
import { absoluteUrl } from "./seo";
import { tr } from "./i18n-content";

export function locationSchema(locale: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${site.url}/#academy`,
    name: site.name,
    description,
    url: absoluteUrl("/", locale),
    email: site.email,
    telephone: site.phone,
    logo: `${site.url}/brand/logo-icon.svg`,
    image: `${site.url}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    sameAs: Object.values(site.social),
  };
}

export function packOfferSchema(pack: Pack, locale: string) {
  const url = absoluteUrl(`/experiencies/${pack.format}/${pack.slug}`, locale);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${pack.name} — ${site.name}`,
    description: tr(pack.description, locale),
    brand: { "@type": "Brand", name: site.name },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      ...(pack.priceFrom !== null ? { price: pack.priceFrom } : {}),
      availability: "https://schema.org/InStock",
      offeredBy: { "@id": `${site.url}/#academy` },
      areaServed: site.address.country,
    },
  };
}
