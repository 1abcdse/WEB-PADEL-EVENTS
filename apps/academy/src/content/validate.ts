import { formats, MAX_HOURS_PER_DAY } from "./formats.ts";
import { packs } from "./packs.ts";
import { dates } from "./dates.ts";
import { extrasById } from "./extras.ts";
import type { Weekday } from "./types.ts";

const WEEKDAY_INDEX: Record<Weekday, number> = { dv: 5, ds: 6, dg: 0, dl: 1 };

/** Retorna la llista d'errors de contingut. Buida = tot correcte. */
export function contentErrors(): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();

  for (const pack of packs) {
    const format = formats[pack.format];
    const where = `Pack "${pack.name}"`;
    if (!format) {
      errors.push(`${where}: format desconegut "${pack.format}"`);
      continue;
    }
    if (slugs.has(pack.slug))
      errors.push(`${where}: slug repetit "${pack.slug}"`);
    slugs.add(pack.slug);

    if (pack.hours > format.maxHours) {
      errors.push(
        `${where}: ${pack.hours} h supera el màxim de ${format.maxHours} h del format "${format.slug}"`,
      );
    }
    if (pack.hours <= 0)
      errors.push(`${where}: les hores han de ser positives`);
    if (pack.nights !== format.nights) {
      errors.push(
        `${where}: ${pack.nights} nits, però el format en té ${format.nights}`,
      );
    }

    const programHours = pack.program.reduce((sum, d) => sum + d.hours, 0);
    if (programHours !== pack.hours) {
      errors.push(
        `${where}: el programa suma ${programHours} h però el pack en declara ${pack.hours}`,
      );
    }
    for (const day of pack.program) {
      if (!format.days.includes(day.day))
        errors.push(`${where}: el dia "${day.day}" no forma part del format`);
      if (day.hours > MAX_HOURS_PER_DAY) {
        errors.push(
          `${where}: ${day.hours} h el dia "${day.day}" supera el màxim de ${MAX_HOURS_PER_DAY} h/dia`,
        );
      }
    }
    for (const id of pack.extras) {
      if (!extrasById[id]) errors.push(`${where}: extra desconegut "${id}"`);
    }
  }

  for (const date of dates) {
    const format = formats[date.format];
    if (!format) {
      errors.push(`Data ${date.id}: format desconegut`);
      continue;
    }
    const day = new Date(`${date.start}T12:00:00Z`);
    if (Number.isNaN(day.getTime())) {
      errors.push(`Data ${date.id}: data invàlida "${date.start}"`);
      continue;
    }
    const expected = WEEKDAY_INDEX[format.days[0]!];
    if (day.getUTCDay() !== expected) {
      errors.push(
        `Data ${date.id}: ${date.start} no és ${format.days[0] === "ds" ? "dissabte" : "divendres"}`,
      );
    }
  }

  return errors;
}

export function assertValidContent(): void {
  const errors = contentErrors();
  if (errors.length > 0) {
    throw new Error(
      `Contingut invàlid a src/content:\n - ${errors.join("\n - ")}`,
    );
  }
}
