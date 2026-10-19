import type { Extra } from "./types";

/** EXTRES OPCIONALS — preus orientatius PROVISIONALS (null = "a consultar") */
export const extras: Extra[] = [
  {
    id: "individual",
    name: {
      ca: "Habitació individual",
      es: "Habitación individual",
      en: "Single room",
    },
    description: {
      ca: "Habitació només per a tu, sense compartir.",
      es: "Habitación solo para ti, sin compartir.",
      en: "A room just for you, no sharing.",
    },
    price: null,
    unit: { ca: "per nit", es: "por noche", en: "per night" },
  },
  {
    id: "acompanyant",
    name: {
      ca: "Acompanyant no jugador",
      es: "Acompañante no jugador",
      en: "Non-playing companion",
    },
    description: {
      ca: "Allotjament i àpats per a qui t'acompanya però no entrena.",
      es: "Alojamiento y comidas para quien te acompaña pero no entrena.",
      en: "Accommodation and meals for someone who joins you but doesn't train.",
    },
    price: null,
    unit: { ca: "per persona", es: "por persona", en: "per person" },
  },
  {
    id: "fisio",
    name: {
      ca: "Sessió de fisioteràpia",
      es: "Sesión de fisioterapia",
      en: "Physio session",
    },
    description: {
      ca: "45 minuts de recuperació amb fisioterapeuta esportiu.",
      es: "45 minutos de recuperación con fisioterapeuta deportivo.",
      en: "45 minutes of recovery with a sports physiotherapist.",
    },
    price: null,
    unit: { ca: "per sessió", es: "por sesión", en: "per session" },
  },
  {
    id: "video",
    name: {
      ca: "Vídeo-anàlisi individual",
      es: "Vídeo-análisis individual",
      en: "Individual video analysis",
    },
    description: {
      ca: "Gravació dels teus partits i informe tècnic personalitzat amb clips.",
      es: "Grabación de tus partidos e informe técnico personalizado con clips.",
      en: "Your matches filmed plus a personalised technical report with clips.",
    },
    price: null,
    unit: { ca: "per estada", es: "por estancia", en: "per stay" },
  },
  {
    id: "privada",
    name: {
      ca: "Classe privada extra",
      es: "Clase privada extra",
      en: "Extra private lesson",
    },
    description: {
      ca: "Una hora un a un amb un entrenador PS (compta dins del màxim d'hores).",
      es: "Una hora uno a uno con un entrenador PS (cuenta dentro del máximo de horas).",
      en: "One hour one-to-one with a PS coach (counts towards the hour limit).",
    },
    price: null,
    unit: { ca: "per hora", es: "por hora", en: "per hour" },
  },
  {
    id: "aeroport",
    name: {
      ca: "Trasllat aeroport",
      es: "Traslado aeropuerto",
      en: "Airport transfer",
    },
    description: {
      ca: "Recollida i tornada a l'aeroport o estació de tren.",
      es: "Recogida y vuelta al aeropuerto o estación de tren.",
      en: "Pick-up and drop-off at the airport or train station.",
    },
    price: null,
    unit: { ca: "anada i tornada", es: "ida y vuelta", en: "return" },
  },
];

export const extrasById = Object.fromEntries(
  extras.map((e) => [e.id, e]),
) as Record<string, Extra>;
