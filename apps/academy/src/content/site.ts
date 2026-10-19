// Dades generals de l'acadèmia. Edita-les aquí; es fan servir a tota la web.

export const site = {
  name: "Padel System Academy",
  shortName: "PS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100",
  email: "marc.lis94@gmail.com",
  whatsapp: {
    // Format internacional sense "+" ni espais (per als enllaços wa.me)
    primary: "34640226321",
    secondary: "34643448859",
    display: ["640 226 321", "643 448 859"],
  },
  location: {
    // PROVISIONAL: les experiències es faran al Club Tennis i Pàdel El Masnou
    // i a un indoor de Montgat (pendent de confirmar).
    region: "Maresme",
    area: "El Masnou · Montgat",
    venues: [
      { id: "masnou", name: "Club Tennis i Pàdel El Masnou", confirmed: true },
      { id: "montgat", name: "Indoor de Montgat (pendent de confirmar)", confirmed: false },
    ],
  },
} as const;
