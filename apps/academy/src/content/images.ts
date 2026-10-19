import type { L } from "./types";

/**
 * IMATGES DEL WEB — ⚠️ TOTES SÓN PLACEHOLDERS A SUBSTITUIR.
 *
 * Mentre `src` estigui buit, es mostra un placeholder gràfic amb l'estètica de la marca
 * i l'etiqueta "FOTO" perquè sigui fàcil detectar què falta.
 *
 * Per posar una foto:
 *  - Pròpia (recomanat): desa-la a /public/img/ i posa src: "/img/nom.jpg"
 *  - Unsplash: posa la URL completa (https://images.unsplash.com/photo-...?w=2000)
 *    Cerques suggerides: "padel", "padel court", "padel player", "padel racket".
 * next/image la servirà optimitzada en AVIF/WebP automàticament.
 */
export interface SiteImage {
  src: string;
  alt: L;
  /** Suggeriment del que hi hauria d'anar (només informatiu) */
  hint: string;
}

const img = (hint: string, alt: L, src = ""): SiteImage => ({ src, alt, hint });

export const images = {
  hero: img("Acció de pàdel en pista, remat o víbora, contrallum", {
    ca: "Jugador de pàdel rematant a la pista de l'acadèmia",
    es: "Jugador de pádel rematando en la pista de la academia",
    en: "Padel player hitting a smash on the academy court",
  }),
  formatWeekend: img("Grup petit entrenant amb entrenador", {
    ca: "Grup entrenant en un clínic de cap de setmana",
    es: "Grupo entrenando en un clinic de fin de semana",
    en: "Group training at a weekend clinic",
  }),
  formatStage: img("Partit intens, jugadors a la xarxa", {
    ca: "Jugadors a la xarxa durant un stage intensiu",
    es: "Jugadores en la red durante un stage intensivo",
    en: "Players at the net during an intensive stage",
  }),
  packEssential: img("Entrenador corregint l'empunyadura", {
    ca: "Entrenador corregint la tècnica",
    es: "Entrenador corrigiendo la técnica",
    en: "Coach correcting technique",
  }),
  packFocus: img("Primer pla d'una víbora", {
    ca: "Jugador executant una víbora",
    es: "Jugador ejecutando una víbora",
    en: "Player hitting a víbora",
  }),
  packMax: img("Jugador suant, alta intensitat", {
    ca: "Entrenament d'alta intensitat",
    es: "Entrenamiento de alta intensidad",
    en: "High-intensity training",
  }),
  packBase: img("Parella somrient a pista", {
    ca: "Parella jugant a pàdel",
    es: "Pareja jugando a pádel",
    en: "Couple playing padel",
  }),
  packPerformance: img("Jugador defensant al vidre", {
    ca: "Defensa de vidre",
    es: "Defensa de pared",
    en: "Glass defence",
  }),
  packElite: img("Remat per 3 en salt", {
    ca: "Remat per 3 en salt",
    es: "Remate por 3 en salto",
    en: "Jumping x3 smash",
  }),
  courts: img("Pistes de vidre il·luminades al capvespre", {
    ca: "Pistes de l'acadèmia",
    es: "Pistas de la academia",
    en: "Academy courts",
  }),
  rooms: img("Habitació neta i lluminosa", {
    ca: "Habitació de l'allotjament",
    es: "Habitación del alojamiento",
    en: "Accommodation room",
  }),
  food: img("Plat saludable, cuina mediterrània", {
    ca: "Àpat saludable al restaurant",
    es: "Comida saludable en el restaurante",
    en: "Healthy meal at the restaurant",
  }),
  analysis: img("Tauleta amb vídeo-anàlisi a peu de pista", {
    ca: "Vídeo-anàlisi a peu de pista",
    es: "Vídeo-análisis a pie de pista",
    en: "Courtside video analysis",
  }),
  academy: img("Equip d'entrenadors a la pista", {
    ca: "Equip de l'acadèmia",
    es: "Equipo de la academia",
    en: "Academy team",
  }),
  gallery1: img("Pilota impactant la pala", {
    ca: "Pilota contra la pala",
    es: "Pelota contra la pala",
    en: "Ball hitting the racket",
  }),
  gallery2: img("Vista aèria de pistes", {
    ca: "Vista aèria de les pistes",
    es: "Vista aérea de las pistas",
    en: "Aerial view of the courts",
  }),
  gallery3: img("Grup celebrant", {
    ca: "Grup celebrant un punt",
    es: "Grupo celebrando un punto",
    en: "Group celebrating a point",
  }),
  gallery4: img("Detall de sabatilles a la gespa", {
    ca: "Sabatilles de pàdel",
    es: "Zapatillas de pádel",
    en: "Padel shoes",
  }),
  gallery5: img("Entrenador explicant tàctica", {
    ca: "Explicació tàctica",
    es: "Explicación táctica",
    en: "Tactical briefing",
  }),
  gallery6: img("Sopar en grup a la terrassa", {
    ca: "Sopar en grup",
    es: "Cena en grupo",
    en: "Group dinner",
  }),
  gallery7: img("Jugadora en defensa", {
    ca: "Jugadora defensant",
    es: "Jugadora defendiendo",
    en: "Player defending",
  }),
  coach1: img("Retrat entrenador", {
    ca: "Retrat d'entrenador",
    es: "Retrato de entrenador",
    en: "Coach portrait",
  }),
  coach2: img("Retrat entrenadora", {
    ca: "Retrat d'entrenadora",
    es: "Retrato de entrenadora",
    en: "Coach portrait",
  }),
  coach3: img("Retrat preparador físic", {
    ca: "Retrat del preparador físic",
    es: "Retrato del preparador físico",
    en: "Fitness coach portrait",
  }),
  coach4: img("Retrat fisioterapeuta", {
    ca: "Retrat de la fisioterapeuta",
    es: "Retrato de la fisioterapeuta",
    en: "Physio portrait",
  }),
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
