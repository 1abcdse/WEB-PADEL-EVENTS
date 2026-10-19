import type { FormatDef, FormatId, Pack } from "./types";

/**
 * Comprova les regles de negoci dels packs i llança un error clar si
 * alguna no es compleix (la web no compila fins que es corregeix).
 */
export function validatePacks(packs: Pack[], formats: Record<FormatId, FormatDef>): void {
  const errors: string[] = [];
  const slugs = new Set<string>();

  for (const p of packs) {
    const f = formats[p.format];
    if (!f) {
      errors.push(`${p.name}: format desconegut "${p.format}"`);
      continue;
    }
    if (p.hours <= 0) errors.push(`${p.name}: les hores han de ser positives`);
    if (p.hours > f.maxHours) {
      errors.push(`${p.name}: ${p.hours}h supera el màxim de ${f.maxHours}h del format "${f.slug}"`);
    }
    if (p.nights !== f.nights) {
      errors.push(`${p.name}: té ${p.nights} nits però el format "${f.slug}" en té ${f.nights}`);
    }
    const programHours = p.program.reduce((sum, d) => sum + d.hours, 0);
    if (programHours !== p.hours) {
      errors.push(`${p.name}: el programa suma ${programHours}h però el pack en declara ${p.hours}h`);
    }
    for (const d of p.program) {
      if (!f.days.includes(d.day)) {
        errors.push(`${p.name}: el dia "${d.day}" no forma part del format "${f.slug}"`);
      }
    }
    const key = `${p.format}/${p.slug}`;
    if (slugs.has(key)) errors.push(`${p.name}: slug repetit "${key}"`);
    slugs.add(key);
  }

  if (errors.length > 0) {
    throw new Error(`Packs no vàlids a src/content/packs.ts:\n- ${errors.join("\n- ")}`);
  }
}

export function formatPrice(price: number | null, locale: string): string {
  if (price === null) return "XXX €";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}
