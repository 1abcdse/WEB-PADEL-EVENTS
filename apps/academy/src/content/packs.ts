/**
 * PACKS I FORMATS — edita aquí preus, hores i textos.
 *
 * ⚠️ Dades PROVISIONALS. Els preus a `null` es mostren com "XXX €".
 * La validació del final comprova que cap pack superi el màxim d'hores
 * del seu format (20h cap de setmana, 30h stage) i que el programa
 * dia a dia sumi exactament les hores del pack. Si no es compleix,
 * la web no compila i et dirà quin pack ho incompleix.
 */
import type { Extra, FormatDef, FormatId, Pack } from "@/lib/types";
import { validatePacks } from "@/lib/packs";

export const FORMATS: Record<FormatId, FormatDef> = {
  weekend: {
    id: "weekend",
    slug: "cap-de-setmana",
    maxHours: 20,
    nights: 1,
    days: ["sat", "sun"],
  },
  stage: {
    id: "stage",
    slug: "stage-4-dies",
    maxHours: 30,
    nights: 3,
    days: ["fri", "sat", "sun", "mon"],
  },
};

const WEEKEND_MEALS = {
  ca: "Dinar i sopar de dissabte, esmorzar i dinar de diumenge",
  es: "Comida y cena del sábado, desayuno y comida del domingo",
  en: "Saturday lunch and dinner, Sunday breakfast and lunch",
};

const STAGE_MEALS = {
  ca: "Pensió completa de divendres (sopar) a dilluns (dinar)",
  es: "Pensión completa del viernes (cena) al lunes (comida)",
  en: "Full board from Friday (dinner) to Monday (lunch)",
};

export const PACKS: Pack[] = [
  // ───────────── FORMAT 1 · CAP DE SETMANA (màx. 20h) ─────────────
  {
    slug: "clinic-essential",
    format: "weekend",
    name: "Clinic Essential",
    hours: 8,
    nights: 1,
    tagline: {
      ca: "El teu primer cap de setmana de pàdel de veritat.",
      es: "Tu primer fin de semana de pádel de verdad.",
      en: "Your first proper padel weekend.",
    },
    forWho: {
      ca: "Iniciació i perfeccionament: vols bases sòlides i guanyar confiança a pista.",
      es: "Iniciación y perfeccionamiento: quieres bases sólidas y ganar confianza en pista.",
      en: "Beginners and improvers who want solid fundamentals and more confidence on court.",
    },
    meals: WEEKEND_MEALS,
    levels: ["initiation", "intermediate"],
    maxPlayersPerGroup: 4,
    priceFrom: null,
    program: [
      { day: "sat", hours: 4, focus: { ca: "Cops bàsics i posició a pista", es: "Golpes básicos y posición en pista", en: "Core strokes and court positioning" } },
      { day: "sun", hours: 4, focus: { ca: "Joc a la xarxa i partits guiats", es: "Juego en la red y partidos guiados", en: "Net play and coached matches" } },
    ],
    extras: ["singleRoom", "companion"],
  },
  {
    slug: "clinic-focus",
    format: "weekend",
    name: "Clinic Focus",
    hours: 14,
    nights: 1,
    tagline: {
      ca: "Un cop, un cap de setmana, un abans i un després.",
      es: "Un golpe, un fin de semana, un antes y un después.",
      en: "One shot, one weekend, a clear before and after.",
    },
    forWho: {
      ca: "Treball tècnic específic: globus, víbora, defensa de vidre… Tu tries el tema.",
      es: "Trabajo técnico específico: globo, víbora, defensa de pared… Tú eliges el tema.",
      en: "Targeted technical work: lob, víbora, glass defence… You choose the theme.",
    },
    meals: WEEKEND_MEALS,
    levels: ["intermediate", "advanced"],
    maxPlayersPerGroup: 4,
    priceFrom: null,
    program: [
      { day: "sat", hours: 7, focus: { ca: "Diagnòstic i tècnica del cop escollit", es: "Diagnóstico y técnica del golpe elegido", en: "Assessment and technique of the chosen shot" } },
      { day: "sun", hours: 7, focus: { ca: "Automatització en situació de joc real", es: "Automatización en situación de juego real", en: "Building it into real match situations" } },
    ],
    extras: ["singleRoom", "companion", "video"],
    featured: true,
  },
  {
    slug: "clinic-max",
    format: "weekend",
    name: "Clinic Max",
    hours: 20,
    nights: 1,
    tagline: {
      ca: "20 hores. Dos dies. Zero excuses.",
      es: "20 horas. Dos días. Cero excusas.",
      en: "20 hours. Two days. Zero excuses.",
    },
    forWho: {
      ca: "Jugadors exigents que volen esprémer cada minut del cap de setmana.",
      es: "Jugadores exigentes que quieren exprimir cada minuto del fin de semana.",
      en: "Demanding players who want to make every minute of the weekend count.",
    },
    meals: WEEKEND_MEALS,
    levels: ["advanced", "competition"],
    maxPlayersPerGroup: 4,
    priceFrom: null,
    program: [
      { day: "sat", hours: 10, focus: { ca: "Tècnica, tàctica i físic específic", es: "Técnica, táctica y físico específico", en: "Technique, tactics and padel fitness" } },
      { day: "sun", hours: 10, focus: { ca: "Patrons de joc i partits d'alta intensitat", es: "Patrones de juego y partidos de alta intensidad", en: "Game patterns and high-intensity matches" } },
    ],
    extras: ["singleRoom", "companion", "physio", "video"],
  },

  // ───────────── FORMAT 2 · STAGE 4 DIES (màx. 30h) ─────────────
  {
    slug: "stage-base",
    format: "stage",
    name: "Stage Base",
    hours: 16,
    nights: 3,
    tagline: {
      ca: "Quatre dies per millorar-ho tot, amb temps per gaudir.",
      es: "Cuatro días para mejorarlo todo, con tiempo para disfrutar.",
      en: "Four days to improve everything, with time to enjoy.",
    },
    forWho: {
      ca: "Millora global del joc amb temps de descans i recuperació.",
      es: "Mejora global del juego con tiempo de descanso y recuperación.",
      en: "All-round improvement with built-in rest and recovery.",
    },
    meals: STAGE_MEALS,
    levels: ["initiation", "intermediate"],
    maxPlayersPerGroup: 4,
    priceFrom: null,
    program: [
      { day: "fri", hours: 3, focus: { ca: "Benvinguda i diagnòstic", es: "Bienvenida y diagnóstico", en: "Welcome and assessment" } },
      { day: "sat", hours: 5, focus: { ca: "Fons de pista i transicions", es: "Fondo de pista y transiciones", en: "Baseline play and transitions" } },
      { day: "sun", hours: 5, focus: { ca: "Xarxa, remat i coordinació en parella", es: "Red, remate y coordinación en pareja", en: "Net, smash and partner coordination" } },
      { day: "mon", hours: 3, focus: { ca: "Partits i informe final", es: "Partidos e informe final", en: "Matches and final report" } },
    ],
    extras: ["singleRoom", "companion", "airport"],
  },
  {
    slug: "stage-performance",
    format: "stage",
    name: "Stage Performance",
    hours: 24,
    nights: 3,
    tagline: {
      ca: "Prepara't per competir com mai ho havies fet.",
      es: "Prepárate para competir como nunca lo habías hecho.",
      en: "Get ready to compete like never before.",
    },
    forWho: {
      ca: "Competició amateur: tornejos, lligues i rànquings.",
      es: "Competición amateur: torneos, ligas y rankings.",
      en: "Amateur competitors: tournaments, leagues and rankings.",
    },
    meals: STAGE_MEALS,
    levels: ["intermediate", "advanced", "competition"],
    maxPlayersPerGroup: 4,
    priceFrom: null,
    program: [
      { day: "fri", hours: 5, focus: { ca: "Diagnòstic i pla personalitzat", es: "Diagnóstico y plan personalizado", en: "Assessment and personal plan" } },
      { day: "sat", hours: 7, focus: { ca: "Tècnica sota pressió", es: "Técnica bajo presión", en: "Technique under pressure" } },
      { day: "sun", hours: 7, focus: { ca: "Tàctica de partit i lectura del rival", es: "Táctica de partido y lectura del rival", en: "Match tactics and reading opponents" } },
      { day: "mon", hours: 5, focus: { ca: "Simulació de torneig i informe", es: "Simulación de torneo e informe", en: "Tournament simulation and report" } },
    ],
    extras: ["singleRoom", "companion", "physio", "video", "airport"],
    featured: true,
  },
  {
    slug: "stage-elite",
    format: "stage",
    name: "Stage Elite",
    hours: 30,
    nights: 3,
    tagline: {
      ca: "30 hores al límit. Per a qui ho vol tot.",
      es: "30 horas al límite. Para quien lo quiere todo.",
      en: "30 hours at the limit. For those who want it all.",
    },
    forWho: {
      ca: "Màxima intensitat: jugadors avançats que volen fer el salt definitiu.",
      es: "Máxima intensidad: jugadores avanzados que quieren dar el salto definitivo.",
      en: "Maximum intensity for advanced players ready for their big leap.",
    },
    meals: STAGE_MEALS,
    levels: ["advanced", "competition"],
    maxPlayersPerGroup: 4,
    priceFrom: null,
    program: [
      { day: "fri", hours: 6, focus: { ca: "Test físic i tècnic complet", es: "Test físico y técnico completo", en: "Full physical and technical testing" } },
      { day: "sat", hours: 9, focus: { ca: "Volums alts de tècnica i físic", es: "Volúmenes altos de técnica y físico", en: "High-volume technique and fitness" } },
      { day: "sun", hours: 9, focus: { ca: "Tàctica avançada i vídeo-anàlisi", es: "Táctica avanzada y vídeo-análisis", en: "Advanced tactics and video analysis" } },
      { day: "mon", hours: 6, focus: { ca: "Partits de competició i informe final", es: "Partidos de competición e informe final", en: "Competitive matches and final report" } },
    ],
    extras: ["singleRoom", "companion", "physio", "video", "airport"],
  },
];

export const EXTRAS: Extra[] = [
  { id: "singleRoom", price: null, label: { ca: "Habitació individual", es: "Habitación individual", en: "Single room" } },
  { id: "companion", price: null, label: { ca: "Acompanyant no jugador", es: "Acompañante no jugador", en: "Non-playing companion" } },
  { id: "physio", price: null, label: { ca: "Sessió de fisioteràpia", es: "Sesión de fisioterapia", en: "Physiotherapy session" } },
  { id: "video", price: null, label: { ca: "Vídeo-anàlisi personalitzada", es: "Vídeo-análisis personalizado", en: "Personal video analysis" } },
  { id: "airport", price: null, label: { ca: "Trasllat a l'aeroport", es: "Traslado al aeropuerto", en: "Airport transfer" } },
];

// Falla en compilar si algun pack incompleix els límits del seu format.
validatePacks(PACKS, FORMATS);
