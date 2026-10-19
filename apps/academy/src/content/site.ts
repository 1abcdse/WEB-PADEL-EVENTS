/**
 * DADES DE CONTACTE I MARCA — edita-les aquí i s'actualitzen a tot el web.
 * ⚠️ Tots els valors són PROVISIONALS: substitueix-los pels reals abans de publicar.
 */
export const site = {
  name: "Padel System Academy",
  short: "PS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://padelsystemacademy.com",
  email: "hola@padelsystemacademy.com",
  phone: "+34 600 000 000",
  /** Número de WhatsApp en format internacional, sense + ni espais */
  whatsapp: "34600000000",
  address: {
    street: "Carrer de l'Exemple, 1",
    city: "Barcelona",
    region: "Catalunya",
    postalCode: "08000",
    country: "ES",
  },
  /** Coordenades per al mapa i Schema.org */
  geo: { lat: 41.3874, lng: 2.1686 },
  /** Aeroport més proper (es mostra a "Com arribar") */
  airport: "Barcelona-El Prat (BCN)",
  social: {
    instagram: "https://instagram.com/padelsystemacademy",
    youtube: "https://youtube.com/@padelsystemacademy",
    tiktok: "https://tiktok.com/@padelsystemacademy",
  },
  legal: {
    owner: "[NOM O RAÓ SOCIAL]",
    taxId: "[NIF]",
  },
} as const;

export const mapEmbedUrl = `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=14&output=embed`;
export const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${site.geo.lat},${site.geo.lng}`;
