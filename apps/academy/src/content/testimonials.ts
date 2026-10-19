import type { L } from "./types";

/** TESTIMONIS — ⚠️ PLACEHOLDERS: substitueix-los per opinions reals (amb permís) */
export interface Testimonial {
  name: string;
  origin: string;
  pack: string;
  rating: number;
  quote: L;
}

export const testimonials: Testimonial[] = [
  {
    name: "Laura M.",
    origin: "Barcelona",
    pack: "Clinic Focus",
    rating: 5,
    quote: {
      ca: "Vaig arribar odiant la bandeja i vaig marxar fent-la amb confiança. El vídeo d'abans i després no enganya.",
      es: "Llegué odiando la bandeja y me fui haciéndola con confianza. El vídeo del antes y el después no engaña.",
      en: "I arrived hating the bandeja and left hitting it with confidence. The before-and-after video doesn't lie.",
    },
  },
  {
    name: "Jordi P.",
    origin: "Girona",
    pack: "Stage Performance",
    rating: 5,
    quote: {
      ca: "Quatre dies molt ben organitzats. Hem pujat de categoria a la lliga aquesta temporada.",
      es: "Cuatro días muy bien organizados. Hemos subido de categoría en la liga esta temporada.",
      en: "Four really well-run days. We moved up a division in our league this season.",
    },
  },
  {
    name: "Sophie D.",
    origin: "Lyon",
    pack: "Stage Elite",
    rating: 5,
    quote: {
      ca: "Intens, professional i amb un ambient genial. L'informe final és or per continuar entrenant a casa.",
      es: "Intenso, profesional y con un ambiente genial. El informe final es oro para seguir entrenando en casa.",
      en: "Intense, professional and a great atmosphere. The final report is gold for training back home.",
    },
  },
];
