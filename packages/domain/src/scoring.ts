import type { CompletedMatch, SetScore, Side } from "./types.js";

/** Regles de puntuació de la Lliga Social (temporada 2026/27). */
export const POINTS = { win: 3, lossWithSet: 1, loss: 0, walkoverWin: 3, walkoverLoss: 0 } as const;

const SUPER_TIE_BREAK_TARGET = 10;

export type ValidationResult = { ok: true } | { ok: false; error: string };

function setWinner(s: SetScore): Side {
  return s.a > s.b ? "A" : "B";
}

/**
 * Sets vàlids: 6-0..6-4, 7-5 i 7-6. El 7-6 només és possible via super tie-break a 10 punts
 * (guanya qui arriba a 10 amb 2 de diferència), que és obligatori informar.
 */
export function validateSet(s: SetScore): ValidationResult {
  const [w, l] = s.a > s.b ? [s.a, s.b] : [s.b, s.a];
  if (!Number.isInteger(s.a) || !Number.isInteger(s.b) || s.a < 0 || s.b < 0)
    return { ok: false, error: "Games must be non-negative integers" };
  if (w === 6 && l <= 4) return s.tieBreak ? { ok: false, error: "Only a 7-6 set has a tie-break" } : { ok: true };
  if (w === 7 && l === 5) return s.tieBreak ? { ok: false, error: "Only a 7-6 set has a tie-break" } : { ok: true };
  if (w === 7 && l === 6) {
    if (!s.tieBreak) return { ok: false, error: "A 7-6 set requires the super tie-break score" };
    const tb = s.tieBreak;
    const [tw, tl] = tb.a > tb.b ? [tb.a, tb.b] : [tb.b, tb.a];
    if ((tb.a > tb.b ? "A" : "B") !== setWinner(s))
      return { ok: false, error: "Tie-break winner must match set winner" };
    if (tw < SUPER_TIE_BREAK_TARGET || tw - tl < 2 || (tw > SUPER_TIE_BREAK_TARGET && tw - tl !== 2))
      return { ok: false, error: `Invalid super tie-break score ${tb.a}-${tb.b}` };
    return { ok: true };
  }
  return { ok: false, error: `Invalid set score ${s.a}-${s.b}` };
}

/** Millor de 3 sets: 2-0 → 2 sets; 1-1 → cal tercer set complet. */
export function validateMatchSets(sets: readonly SetScore[]): ValidationResult {
  if (sets.length < 2 || sets.length > 3) return { ok: false, error: "A match has 2 or 3 sets" };
  for (const s of sets) {
    const v = validateSet(s);
    if (!v.ok) return v;
  }
  const [s1, s2] = sets as [SetScore, SetScore];
  const split = setWinner(s1) !== setWinner(s2);
  if (split && sets.length !== 3) return { ok: false, error: "Sets are 1-1: a third set is required" };
  if (!split && sets.length === 3) return { ok: false, error: "Match already decided after two sets" };
  return { ok: true };
}

export function walkoverSets(winner: Side): SetScore[] {
  return winner === "A" ? [{ a: 6, b: 0 }, { a: 6, b: 0 }] : [{ a: 0, b: 6 }, { a: 0, b: 6 }];
}

export interface SideTotals {
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  won: boolean;
  points: number;
}

/** Totals per a una banda del partit. El set 7-6 compta com 7 i 6 jocs. */
export function sideTotals(match: CompletedMatch, side: Side): SideTotals {
  let setsA = 0, setsB = 0, gamesA = 0, gamesB = 0;
  for (const s of match.sets) {
    gamesA += s.a;
    gamesB += s.b;
    if (s.a > s.b) setsA++;
    else setsB++;
  }
  const [setsWon, setsLost, gamesWon, gamesLost] =
    side === "A" ? [setsA, setsB, gamesA, gamesB] : [setsB, setsA, gamesB, gamesA];
  const won = setsWon > setsLost;
  let points: number;
  if (match.outcome === "WALKOVER") points = won ? POINTS.walkoverWin : POINTS.walkoverLoss;
  else points = won ? POINTS.win : setsWon > 0 ? POINTS.lossWithSet : POINTS.loss;
  return { setsWon, setsLost, gamesWon, gamesLost, won, points };
}

export function matchWinner(match: CompletedMatch): Side {
  return sideTotals(match, "A").won ? "A" : "B";
}
