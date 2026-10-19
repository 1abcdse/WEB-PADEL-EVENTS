import type { ImageKey } from "./images";
import type { L } from "./types";

/** EQUIP — ⚠️ noms i bios PROVISIONALS */
export interface Coach {
  name: string;
  role: L;
  bio: L;
  image: ImageKey;
}

export const team: Coach[] = [
  {
    name: "[Nom Cognom]",
    role: {
      ca: "Director i cap tècnic",
      es: "Director y jefe técnico",
      en: "Director & head coach",
    },
    bio: {
      ca: "Entrenador nacional amb més de 12 anys formant jugadors de competició. Creador del mètode PS.",
      es: "Entrenador nacional con más de 12 años formando jugadores de competición. Creador del método PS.",
      en: "National-level coach with 12+ years developing competitive players. Creator of the PS method.",
    },
    image: "coach1",
  },
  {
    name: "[Nom Cognom]",
    role: {
      ca: "Entrenadora de rendiment",
      es: "Entrenadora de rendimiento",
      en: "Performance coach",
    },
    bio: {
      ca: "Exjugadora de circuit professional. Especialista en joc aeri i tàctica de parella.",
      es: "Exjugadora de circuito profesional. Especialista en juego aéreo y táctica de pareja.",
      en: "Former pro-tour player. Specialist in overheads and pair tactics.",
    },
    image: "coach2",
  },
  {
    name: "[Nom Cognom]",
    role: {
      ca: "Preparador físic",
      es: "Preparador físico",
      en: "Strength & conditioning coach",
    },
    bio: {
      ca: "Graduat en CAFE. Dissenya el treball físic específic de cada stage.",
      es: "Graduado en CAFD. Diseña el trabajo físico específico de cada stage.",
      en: "Sports science graduate. Designs the padel-specific conditioning for every stage.",
    },
    image: "coach3",
  },
  {
    name: "[Nom Cognom]",
    role: { ca: "Fisioterapeuta", es: "Fisioterapeuta", en: "Physiotherapist" },
    bio: {
      ca: "Fisioterapeuta esportiva. Prevenció de lesions i recuperació entre sessions.",
      es: "Fisioterapeuta deportiva. Prevención de lesiones y recuperación entre sesiones.",
      en: "Sports physio. Injury prevention and recovery between sessions.",
    },
    image: "coach4",
  },
];
