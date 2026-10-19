import type { Format, FormatSlug } from "./types";

/**
 * ELS DOS FORMATS — el cor del negoci.
 * maxHours és un límit dur: cap pack el pot superar (es comprova a validate.ts).
 */
export const formats: Record<FormatSlug, Format> = {
  "cap-de-setmana": {
    slug: "cap-de-setmana",
    name: {
      ca: "Clinic cap de setmana",
      es: "Clinic fin de semana",
      en: "Weekend clinic",
    },
    badge: { ca: "Cap de setmana", es: "Fin de semana", en: "Weekend" },
    tagline: {
      ca: "Dissabte i diumenge. Fins a 20 hores de pàdel amb tot inclòs.",
      es: "Sábado y domingo. Hasta 20 horas de pádel con todo incluido.",
      en: "Saturday and Sunday. Up to 20 hours of padel, all inclusive.",
    },
    description: {
      ca: "Clínics temàtics i entrenaments específics concentrats en dos dies. Arribes dissabte al matí, entrenes, dorms a l'acadèmia i diumenge tornes a casa amb un salt de nivell que es nota.",
      es: "Clinics temáticos y entrenamientos específicos concentrados en dos días. Llegas el sábado por la mañana, entrenas, duermes en la academia y el domingo vuelves a casa con un salto de nivel que se nota.",
      en: "Themed clinics and targeted training packed into two days. Arrive Saturday morning, train, sleep at the academy and head home on Sunday with a level-up you can feel.",
    },
    maxHours: 20,
    nights: 1,
    days: ["ds", "dg"],
    forWho: [
      {
        ca: "Vols millorar un cop concret (víbora, globus, defensa de vidre…) sense agafar dies de festa.",
        es: "Quieres mejorar un golpe concreto (víbora, globo, defensa de pared…) sin coger días libres.",
        en: "You want to fix a specific shot (víbora, lob, glass defence…) without taking days off work.",
      },
      {
        ca: "Busques un cap de setmana diferent amb la teva parella de joc o amb amics.",
        es: "Buscas un fin de semana diferente con tu pareja de juego o con amigos.",
        en: "You're after a different kind of weekend with your playing partner or friends.",
      },
      {
        ca: "Vols provar el mètode PS abans de fer un stage complet.",
        es: "Quieres probar el método PS antes de hacer un stage completo.",
        en: "You want to try the PS method before committing to a full stage.",
      },
    ],
  },
  "stage-4-dies": {
    slug: "stage-4-dies",
    name: {
      ca: "Stage intensiu 4 dies",
      es: "Stage intensivo 4 días",
      en: "4-day intensive stage",
    },
    badge: { ca: "Stage 4 dies", es: "Stage 4 días", en: "4-day stage" },
    tagline: {
      ca: "De divendres a dilluns. Immersió total, fins a 30 hores de pàdel.",
      es: "De viernes a lunes. Inmersión total, hasta 30 horas de pádel.",
      en: "Friday to Monday. Total immersion, up to 30 hours of padel.",
    },
    description: {
      ca: "Quatre dies per viure com un jugador professional: entrenament tècnic i tàctic, partits dirigits, preparació física, vídeo-anàlisi i descans de qualitat. Tornes amb un pla clar per continuar progressant.",
      es: "Cuatro días para vivir como un jugador profesional: entrenamiento técnico y táctico, partidos dirigidos, preparación física, vídeo-análisis y descanso de calidad. Vuelves con un plan claro para seguir progresando.",
      en: "Four days living like a pro: technical and tactical training, coached match play, conditioning, video analysis and proper rest. You leave with a clear plan to keep improving.",
    },
    maxHours: 30,
    nights: 3,
    days: ["dv", "ds", "dg", "dl"],
    forWho: [
      {
        ca: "Jugues lligues o tornejos i vols fer un salt de nivell real abans de la temporada.",
        es: "Juegas ligas o torneos y quieres dar un salto de nivel real antes de la temporada.",
        en: "You play leagues or tournaments and want a real step up before the season.",
      },
      {
        ca: "Vens de fora i vols combinar pàdel d'alt nivell amb un viatge.",
        es: "Vienes de fuera y quieres combinar pádel de alto nivel con un viaje.",
        en: "You're travelling in and want to combine high-level padel with a trip.",
      },
      {
        ca: "Vols temps per assimilar: entrenar, descansar, revisar vídeo i tornar a pista.",
        es: "Quieres tiempo para asimilar: entrenar, descansar, revisar vídeo y volver a pista.",
        en: "You want time to absorb it all: train, rest, review video and go again.",
      },
    ],
  },
};

export const formatList = Object.values(formats);

/** Màxim d'hores de pàdel en un sol dia (qualsevol format) */
export const MAX_HOURS_PER_DAY = 10;

export function isFormatSlug(value: string): value is keyof typeof formats {
  return value in formats;
}
