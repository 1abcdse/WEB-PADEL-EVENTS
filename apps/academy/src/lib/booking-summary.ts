import { dates } from "@/content/dates";
import { extrasById } from "@/content/extras";
import { formats } from "@/content/formats";
import { getPack } from "@/content/packs";
import type { FormatSlug } from "@/content/types";
import type { BookingInput } from "./booking-schema";
import { formatDateRange, formatPrice, tr } from "./i18n-content";

/** Traductor mínim compatible amb next-intl (client i servidor) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Translate = (key: any, values?: any) => string;

export interface SummaryRow {
  label: string;
  value: string;
}

/**
 * Resum llegible d'una sol·licitud. Es fa servir al pas final del configurador,
 * al missatge de WhatsApp i als correus (propietari i client).
 * `t` ha de ser un traductor de l'arrel de missatges.
 */
export function bookingSummary(
  data: Partial<BookingInput>,
  locale: string,
  t: Translate,
): SummaryRow[] {
  const s = (key: string) => t(`booking.summary.${key}`);
  const format = data.format ? formats[data.format as FormatSlug] : undefined;
  const pack =
    data.format && data.pack ? getPack(data.format, data.pack) : undefined;
  const date = dates.find((d) => d.id === data.date);
  const extras = (data.extras ?? [])
    .map((id) => extrasById[id])
    .filter(Boolean);

  const hours = pack ? pack.hours : data.customHours;
  const rows: SummaryRow[] = [
    { label: s("format"), value: format ? tr(format.name, locale) : "—" },
    {
      label: s("pack"),
      value: pack
        ? pack.name
        : data.pack === "custom"
          ? t("email.customHours")
          : "—",
    },
    { label: s("hours"), value: hours ? `${hours} h` : "—" },
    {
      label: s("date"),
      value: date
        ? `${formatDateRange(date, locale)}${date.note ? ` · ${tr(date.note, locale)}` : ""}`
        : data.date === "flexible"
          ? t("booking.flexible")
          : "—",
    },
    { label: s("players"), value: String(data.players ?? "—") },
    {
      label: s("level"),
      value: data.level ? t(`common.levels.${data.level}`) : "—",
    },
    { label: s("companions"), value: String(data.companions ?? 0) },
    {
      label: s("extras"),
      value: extras.length
        ? extras.map((e) => tr(e!.name, locale)).join(", ")
        : s("none"),
    },
  ];
  if (pack)
    rows.push({
      label: s("priceFrom"),
      value: `${t("common.from")} ${formatPrice(pack.priceFrom, locale)} / ${t("common.perPerson")}`,
    });
  return rows;
}

export function contactRows(
  data: Partial<BookingInput>,
  t: Translate,
): SummaryRow[] {
  const rows = [
    { label: t("booking.name"), value: data.name ?? "" },
    { label: t("booking.email"), value: data.email ?? "" },
    { label: t("booking.phone"), value: data.phone ?? "" },
  ];
  if (data.comments)
    rows.push({ label: t("booking.summary.comments"), value: data.comments });
  return rows;
}

export function summaryText(rows: SummaryRow[]): string {
  return rows.map((r) => `• ${r.label}: ${r.value}`).join("\n");
}
