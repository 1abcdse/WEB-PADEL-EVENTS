import type { EntryId } from "./types.js";

export interface RoundRobinPairing {
  entryA: EntryId;
  entryB: EntryId;
}

export interface RoundRobinRound {
  number: number;
  matches: RoundRobinPairing[];
  /** Parella que descansa aquesta jornada (només amb un nombre imparell d'entries). */
  bye?: EntryId;
}

/**
 * Mètode del cercle: la primera entry queda fixa i la resta roten en sentit horari.
 * Amb N imparell s'afegeix un "bye" fictici. Determinista: mateixa entrada → mateixa sortida.
 */
export function generateRoundRobin(entries: readonly EntryId[]): RoundRobinRound[] {
  if (entries.length < 2) throw new Error("Round robin requires at least 2 entries");
  if (new Set(entries).size !== entries.length) throw new Error("Round robin entries must be unique");

  let slots: (EntryId | null)[] = [...entries];
  if (slots.length % 2 === 1) slots.push(null);
  const n = slots.length;
  const rounds: RoundRobinRound[] = [];

  for (let r = 0; r < n - 1; r++) {
    const round: RoundRobinRound = { number: r + 1, matches: [] };
    for (let i = 0; i < n / 2; i++) {
      const a = slots[i]!;
      const b = slots[n - 1 - i]!;
      if (a === null || b === null) round.bye = (a ?? b)!;
      else round.matches.push({ entryA: a, entryB: b });
    }
    rounds.push(round);
    slots = [slots[0]!, slots[n - 1]!, ...slots.slice(1, n - 1)];
  }
  return rounds;
}
