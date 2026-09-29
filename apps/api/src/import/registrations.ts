/**
 * Lector del full d'inscrits exportat de Google Sheets (format "## PARELLA N" + fitxa per jugador/a):
 *
 *   ## PARELLA 1
 *   Nom Cognom Cognom
 *   Telèfon: 600000000
 *   Email: [nom@exemple.cat](mailto:nom@exemple.cat)
 *   Nivell: C
 *   Talla: L
 *   Abonada: Sí
 */

export interface ParsedPlayer {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  declaredLevel?: string;
  shirtSize?: string;
  isMember: boolean;
}

export interface ParsedPair {
  number: number;
  players: [ParsedPlayer, ParsedPlayer];
  /** Email de contacte de la parella tal com venia al full (pot ser de qualsevol de les dues). */
  contactEmail?: string;
}

export interface ParseResult {
  pairs: ParsedPair[];
  warnings: string[];
}

const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** "Maria Teresa Toledo Martínez" → nom "Maria Teresa", cognoms "Toledo Martínez". */
export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  const firstCount = parts.length >= 4 ? 2 : 1;
  return { firstName: parts.slice(0, firstCount).join(" "), lastName: parts.slice(firstCount).join(" ") };
}

/** Assigna l'email de contacte a la jugadora que hi surt (p. ex. "georgina.jene" → Georgina Jené); si no, a la primera. */
export function emailOwner(email: string, players: readonly { firstName: string; lastName: string }[]): number {
  const local = strip(email.split("@")[0] ?? "").replace(/[^a-z]/g, "");
  let best = 0;
  let bestScore = 0;
  players.forEach((p, i) => {
    const tokens = strip(`${p.firstName} ${p.lastName}`).split(/\s+/).filter((t) => t.length >= 3);
    const score = tokens.filter((t) => local.includes(t)).length;
    if (score > bestScore) [best, bestScore] = [i, score];
  });
  return best;
}

const field = (line: string) => /^(Telèfon|Telefon|Email|Nivell|Talla|Abonada|Abonat|Soci|Sòcia)\s*:\s*(.*)$/i.exec(line.trim());

export function parseRegistrations(text: string): ParseResult {
  const warnings: string[] = [];
  const pairs: ParsedPair[] = [];
  const blocks = text.split(/^##\s+PARELLA\s+/im).slice(1);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim());
    const number = Number(lines[0]);
    const raw: { name: string; fields: Record<string, string> }[] = [];
    for (const line of lines.slice(1)) {
      if (!line || line === "---" || line.startsWith("#")) continue;
      const f = field(line);
      if (f) {
        const current = raw[raw.length - 1];
        if (!current) {
          warnings.push(`Parella ${number}: dada sense jugador/a: "${line}"`);
          continue;
        }
        current.fields[strip(f[1]!)] = f[2]!.trim();
      } else raw.push({ name: line, fields: {} });
    }
    if (raw.length !== 2) {
      warnings.push(`Parella ${number}: s'esperaven 2 jugadors/es i n'hi ha ${raw.length}`);
      continue;
    }

    const players = raw.map((r) => {
      const { firstName, lastName } = splitName(r.name);
      const member = r.fields.abonada ?? r.fields.abonat ?? r.fields.soci ?? r.fields.socia;
      const p: ParsedPlayer = { firstName, lastName, isMember: /^s[ií]/i.test(member ?? "") };
      if (member === undefined) warnings.push(`Parella ${number}: ${r.name} no indica si és abonat/da (es compta com a no abonat/da)`);
      const phone = r.fields.telefon?.replace(/\D/g, "");
      if (phone) p.phone = phone;
      else warnings.push(`Parella ${number}: ${r.name} no té telèfon`);
      if (r.fields.nivell) p.declaredLevel = r.fields.nivell.toUpperCase();
      if (r.fields.talla) p.shirtSize = r.fields.talla.toUpperCase();
      return p;
    }) as [ParsedPlayer, ParsedPlayer];

    const pair: ParsedPair = { number, players };
    const emails = raw.flatMap((r) => (r.fields.email ? [r.fields.email] : []));
    for (const e of emails) {
      const email = /mailto:([^)\s]+)/i.exec(e)?.[1] ?? /[^\s[\]()]+@[^\s[\]()]+/.exec(e)?.[0];
      if (!email) continue;
      pair.contactEmail = email.toLowerCase();
      const owner = players[emailOwner(email, players)]!;
      if (!owner.email) owner.email = email.toLowerCase();
    }
    const levels = new Set(players.map((p) => p.declaredLevel).filter(Boolean));
    if (levels.size > 1) warnings.push(`Parella ${number}: nivells diferents (${[...levels].join(" / ")})`);
    pairs.push(pair);
  }
  return { pairs, warnings };
}
