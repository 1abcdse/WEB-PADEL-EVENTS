import { matchWinner } from "./scoring.js";
import type { StandingRow } from "./standings.js";
import type { CompletedMatch, EntryId } from "./types.js";

export type PlayoffSource = { position: number } | { winnerOf: string };

export interface PlayoffSlot {
  code: string;
  bracket: "MAIN" | "CONSOLATION";
  round: number;
  a: PlayoffSource;
  b: PlayoffSource;
}

/**
 * Quadre per grup: Main = semis 1v4 i 2v3 + final; Consolation = 5v6.
 * El 1r i el 2n juguen la semi com a parella A (primer cap de sèrie).
 */
export const PLAYOFF_TEMPLATE: readonly PlayoffSlot[] = [
  { code: "SF1", bracket: "MAIN", round: 1, a: { position: 1 }, b: { position: 4 } },
  { code: "SF2", bracket: "MAIN", round: 1, a: { position: 2 }, b: { position: 3 } },
  { code: "CF", bracket: "CONSOLATION", round: 1, a: { position: 5 }, b: { position: 6 } },
  { code: "F", bracket: "MAIN", round: 2, a: { winnerOf: "SF1" }, b: { winnerOf: "SF2" } },
];

export interface PlayoffPairing {
  code: string;
  bracket: "MAIN" | "CONSOLATION";
  round: number;
  entryA?: EntryId;
  entryB?: EntryId;
}

/**
 * Resol el quadre a partir de la classificació final del grup i dels partits de playoff jugats
 * (`matchesByCode`). Falla si hi ha empats sense resoldre: primer ha de decidir el coordinador.
 */
export function resolvePlayoffs(
  standings: readonly StandingRow[],
  matchesByCode: Readonly<Record<string, CompletedMatch>> = {},
): PlayoffPairing[] {
  const tied = standings.filter((r) => r.unresolvedTieWith);
  if (tied.length > 0)
    throw new Error(`Unresolved tie between ${tied.map((r) => r.entryId).join(", ")}: coordinator decision required`);
  const byPosition = new Map(standings.map((r) => [r.position, r.entryId]));

  const resolve = (src: PlayoffSource): EntryId | undefined => {
    if ("position" in src) return byPosition.get(src.position);
    const m = matchesByCode[src.winnerOf];
    if (!m) return undefined;
    return matchWinner(m) === "A" ? m.entryA : m.entryB;
  };

  return PLAYOFF_TEMPLATE.filter((s) => {
    const needs = [s.a, s.b].filter((x): x is { position: number } => "position" in x);
    return needs.every((x) => byPosition.has(x.position));
  }).map((s) => {
    const p: PlayoffPairing = { code: s.code, bracket: s.bracket, round: s.round };
    const a = resolve(s.a);
    const b = resolve(s.b);
    if (a) p.entryA = a;
    if (b) p.entryB = b;
    return p;
  });
}
