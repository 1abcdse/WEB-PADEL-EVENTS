import type { Locale } from "@/i18n/routing";

/** Text traduït als tres idiomes de la web. */
export type Localized = Record<Locale, string>;

export type FormatId = "weekend" | "stage";
export type DayKey = "fri" | "sat" | "sun" | "mon";
export type Level = "initiation" | "intermediate" | "advanced" | "competition";
export type ExtraId = "singleRoom" | "companion" | "physio" | "video" | "airport";

export type FormatDef = {
  id: FormatId;
  /** Segment d'URL: /experiencies/<slug> */
  slug: string;
  /** Límit dur d'hores de pàdel del format */
  maxHours: number;
  nights: number;
  days: DayKey[];
};

export type ProgramDay = {
  day: DayKey;
  /** Hores de pàdel d'aquest dia */
  hours: number;
  focus: Localized;
};

export type Pack = {
  /** Segment d'URL: /experiencies/<format>/<slug> */
  slug: string;
  format: FormatId;
  name: string;
  hours: number;
  nights: number;
  tagline: Localized;
  forWho: Localized;
  meals: Localized;
  levels: Level[];
  maxPlayersPerGroup: number;
  /** Preu "des de" en euros. null = encara per definir (es mostra "XXX €") */
  priceFrom: number | null;
  program: ProgramDay[];
  extras: ExtraId[];
  featured?: boolean;
};

export type Extra = {
  id: ExtraId;
  label: Localized;
  /** Preu en euros. null = a consultar */
  price: number | null;
};

export function pick(text: Localized, locale: string): string {
  return text[locale as Locale] ?? text.ca;
}
