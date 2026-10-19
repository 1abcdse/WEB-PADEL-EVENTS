import type { Locale } from "@/i18n/routing";

/** Text traduït. El català és la font; ES i EN han d'estar sempre omplerts. */
export type L = Record<Locale, string>;

export type FormatSlug = "cap-de-setmana" | "stage-4-dies";

export type Level = "iniciacio" | "intermedi" | "avancat" | "competicio";

export type Weekday = "dv" | "ds" | "dg" | "dl";

export interface Format {
  slug: FormatSlug;
  name: L;
  badge: L;
  tagline: L;
  description: L;
  /** Límit dur d'hores de pàdel. Es valida a validate.ts. */
  maxHours: number;
  nights: number;
  days: Weekday[];
  forWho: L[];
}

export interface ProgramDay {
  day: Weekday;
  title: L;
  hours: number;
  items: L[];
}

export interface Pack {
  slug: string;
  format: FormatSlug;
  name: string;
  tagline: L;
  description: L;
  hours: number;
  nights: number;
  meals: L;
  levels: Level[];
  /** Places màximes per grup d'entrenament */
  groupSize: number;
  /** Preu per persona "des de". null = es mostra "XXX €" */
  priceFrom: number | null;
  featured?: boolean;
  program: ProgramDay[];
  includes: L[];
  excludes: L[];
  /** ids d'extres (src/content/extras.ts) disponibles per a aquest pack */
  extras: string[];
  /** clau d'imatge (src/content/images.ts) */
  image: string;
}

export interface Extra {
  id: string;
  name: L;
  description: L;
  /** Preu orientatiu. null = "a consultar" */
  price: number | null;
  unit: L;
}

export type DateStatus = "disponible" | "poques-places" | "complet";

export interface SessionDate {
  id: string;
  format: FormatSlug;
  /** Primer dia (dissabte per al cap de setmana, divendres per a l'stage), AAAA-MM-DD */
  start: string;
  status: DateStatus;
  /** Opcional: tema del clínic o nota visible */
  note?: L;
}
