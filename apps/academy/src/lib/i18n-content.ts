import type { Locale } from "@/i18n/routing";
import type { DateStatus, FormatSlug, L, SessionDate } from "@/content/types";

export const tr = (text: L, locale: string): string =>
  text[locale as Locale] ?? text.ca;

const intlLocale: Record<Locale, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-GB",
};

export function formatPrice(price: number | null, locale: string): string {
  if (price === null) return "XXX €";
  return new Intl.NumberFormat(intlLocale[locale as Locale] ?? "ca-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

const FORMAT_LENGTH_DAYS: Record<FormatSlug, number> = {
  "cap-de-setmana": 1,
  "stage-4-dies": 3,
};

export function dateRange(date: SessionDate): { start: Date; end: Date } {
  const start = new Date(`${date.start}T12:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + FORMAT_LENGTH_DAYS[date.format]);
  return { start, end };
}

export function formatDateRange(date: SessionDate, locale: string): string {
  const { start, end } = dateRange(date);
  const fmt = new Intl.DateTimeFormat(intlLocale[locale as Locale] ?? "ca-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const year = end.getUTCFullYear();
  return `${fmt.formatRange(start, end)} ${year}`;
}

/** Dates futures (avui inclòs), ordenades */
export function upcoming(
  dates: SessionDate[],
  format?: FormatSlug,
): SessionDate[] {
  const today = new Date().toISOString().slice(0, 10);
  return dates
    .filter((d) => d.start >= today && (!format || d.format === format))
    .sort((a, b) => a.start.localeCompare(b.start));
}

export const isBookable = (status: DateStatus) => status !== "complet";
