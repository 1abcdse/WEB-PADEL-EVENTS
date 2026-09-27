import type { CompletedMatch, SetScore, Side, TimeLimitFinish } from "./types.js";

/** Regles de puntuació de la Lliga Social (temporada 2026/27). */
export const POINTS = { win: 3, lossWithSet: 1, loss: 0, walkoverWin: 3, walkoverLoss: 0 } as const;

const SUPER_TIE_BREAK_TARGET = 10;

export type ValidationResult = { ok: true } | { ok: false; error: string };

function setWinner(s: { a: number; b: number }): Side {
  return s.a > s.b ? "A" : "B";
}

/** Super tie-break a 10 punts amb 2 de diferència (10-8, 11-9, 12-10…). */
export function validateSuperTieBreak(tb: { a: number; b: number }): ValidationResult {
  const [w, l] = tb.a > tb.b ? [tb.a, tb.b] : [tb.b, tb.a];
  if (!Number.isInteger(tb.a) || !Number.isInteger(tb.b) || l < 0)
    return { ok: false, error: "Tie-break points must be non-negative integers" };
  if (w < SUPER_TIE_BREAK_TARGET || w - l < 2 || (w > SUPER_TIE_BREAK_TARGET && w - l !== 2))
    return { ok: false, error: `Invalid super tie-break score ${tb.a}-${tb.b}` };
  return { ok: true };
}

/**
 * Sets vàlids: 6-0..6-4, 7-5 i 7-6. El 7-6 només és possible via super tie-break a 10 punts,
 * que és obligatori informar.
 */
export function validateSet(s: SetScore): ValidationResult {
  const [w, l] = s.a > s.b ? [s.a, s.b] : [s.b, s.a];
  if (!Number.isInteger(s.a) || !Number.isInteger(s.b) || s.a < 0 || s.b < 0)
    return { ok: false, error: "Games must be non-negative integers" };
  if ((w === 6 && l <= 4) || (w === 7 && l === 5))
    return s.tieBreak ? { ok: false, error: "Only a 7-6 set has a tie-break" } : { ok: true };
  if (w === 7 && l === 6) {
    if (!s.tieBreak) return { ok: false, error: "A 7-6 set requires the super tie-break score" };
    if (setWinner(s.tieBreak) !== setWinner(s))
      return { ok: false, error: "Tie-break winner must match set winner" };
    return validateSuperTieBreak(s.tieBreak);
  }
  return { ok: false, error: `Invalid set score ${s.a}-${s.b}` };
}

function countSets(sets: readonly SetScore[]) {
  let a = 0, b = 0;
  for (const s of sets) setWinner(s) === "A" ? a++ : b++;
  return { a, b };
}

/**
 * Millor de 3 sets: 2-0 → 2 sets; 1-1 → cal tercer set complet.
 * Si el partit no acaba a les 23:00 (`timeLimit`): els sets acabats (0–2, sense guanyador encara),
 * el set en joc opcional i un super tie-break a 10 que decideix el partit.
 */
export function validateMatchSets(sets: readonly SetScore[], timeLimit?: TimeLimitFinish): ValidationResult {
  for (const s of sets) {
    const v = validateSet(s);
    if (!v.ok) return v;
  }
  const count = countSets(sets);

  if (timeLimit) {
    if (count.a >= 2 || count.b >= 2) return { ok: false, error: "Match was already decided before the time limit" };
    const p = timeLimit.partialSet;
    if (p) {
      if (p.a < 0 || p.b < 0 || p.a > 6 || p.b > 6 || !Number.isInteger(p.a) || !Number.isInteger(p.b))
        return { ok: false, error: `Invalid unfinished set ${p.a}-${p.b}` };
      if (validateSet(p).ok) return { ok: false, error: "The unfinished set is actually finished" };
    }
    return validateSuperTieBreak(timeLimit.superTieBreak);
  }

  if (sets.length < 2 || sets.length > 3) return { ok: false, error: "A match has 2 or 3 sets" };
  const split = setWinner(sets[0]!) !== setWinner(sets[1]!);
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

/**
 * Totals per a una banda del partit. El set 7-6 compta com 7 i 6 jocs.
 * Amb límit horari: els jocs del set en joc compten, i el super tie-break final compta
 * com un set i un joc (1-0) per a qui el guanya, que és el guanyador del partit.
 */
export function sideTotals(match: CompletedMatch, side: Side): SideTotals {
  let gamesA = 0, gamesB = 0;
  for (const s of match.sets) {
    gamesA += s.a;
    gamesB += s.b;
  }
  const count = countSets(match.sets);
  let winner: Side = count.a > count.b ? "A" : "B";
  const tl = match.timeLimit;
  if (tl) {
    gamesA += tl.partialSet?.a ?? 0;
    gamesB += tl.partialSet?.b ?? 0;
    winner = setWinner(tl.superTieBreak);
    if (winner === "A") { count.a++; gamesA++; } else { count.b++; gamesB++; }
  }
  const [setsWon, setsLost, gamesWon, gamesLost] =
    side === "A" ? [count.a, count.b, gamesA, gamesB] : [count.b, count.a, gamesB, gamesA];
  const won = winner === side;
  let points: number;
  if (match.outcome === "WALKOVER") points = won ? POINTS.walkoverWin : POINTS.walkoverLoss;
  else points = won ? POINTS.win : setsWon > 0 ? POINTS.lossWithSet : POINTS.loss;
  return { setsWon, setsLost, gamesWon, gamesLost, won, points };
}

export function matchWinner(match: CompletedMatch): Side {
  return sideTotals(match, "A").won ? "A" : "B";
}
