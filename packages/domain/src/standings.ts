import { matchWinner, sideTotals } from "./scoring.js";
import type { CompletedMatch, EntryId } from "./types.js";

export type TiebreakCriterion =
  | "POINTS"
  | "HEAD_TO_HEAD"
  | "GAME_DIFFERENCE"
  | "SET_DIFFERENCE"
  | "MINI_LEAGUE"
  | "COORDINATOR";

export interface StandingRow {
  entryId: EntryId;
  position: number;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  gameDifference: number;
  setDifference: number;
  /** Criteri que ha separat aquesta entry de les empatades a punts (si n'hi havia). */
  decidedBy?: TiebreakCriterion;
  /** Entries amb qui l'empat no s'ha pogut resoldre: cal decisió del coordinador o partit extra. */
  unresolvedTieWith?: EntryId[];
}

export interface StandingsInput {
  entries: readonly EntryId[];
  /** Partits del grup amb resultat. Els REGULAR sumen a la classificació; els TIEBREAK només desempaten. */
  matches: readonly CompletedMatch[];
  /** Ordre fixat pel coordinador per a empats irresolubles (per exemple, després d'un partit extra). */
  coordinatorOrder?: readonly EntryId[];
}

interface Stats {
  played: number; won: number; lost: number; points: number;
  setsWon: number; setsLost: number; gamesWon: number; gamesLost: number;
}

const emptyStats = (): Stats => ({
  played: 0, won: 0, lost: 0, points: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0,
});

function accumulate(ids: ReadonlySet<EntryId>, matches: readonly CompletedMatch[]): Map<EntryId, Stats> {
  const stats = new Map<EntryId, Stats>();
  for (const id of ids) stats.set(id, emptyStats());
  for (const m of matches) {
    if (!ids.has(m.entryA) || !ids.has(m.entryB)) continue;
    for (const side of ["A", "B"] as const) {
      const s = stats.get(side === "A" ? m.entryA : m.entryB)!;
      const t = sideTotals(m, side);
      s.played++;
      if (t.won) s.won++;
      else s.lost++;
      s.points += t.points;
      s.setsWon += t.setsWon;
      s.setsLost += t.setsLost;
      s.gamesWon += t.gamesWon;
      s.gamesLost += t.gamesLost;
    }
  }
  return stats;
}

/** Agrupa (mantenint l'ordre) segons una clau numèrica descendent. */
function bucketBy(ids: EntryId[], key: (id: EntryId) => number[]): EntryId[][] {
  const cmp = (x: number[], y: number[]) => {
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return y[i]! - x[i]!;
    return 0;
  };
  const sorted = [...ids].sort((a, b) => cmp(key(a), key(b)));
  const buckets: EntryId[][] = [];
  for (const id of sorted) {
    const last = buckets[buckets.length - 1];
    if (last && cmp(key(last[0]!), key(id)) === 0) last.push(id);
    else buckets.push([id]);
  }
  return buckets;
}

/**
 * Classificació de grup amb desempat en cascada (decisió 2026/27):
 *   1. Punts.
 *   2. Empat de 2: enfrontament directe (un partit TIEBREAK, si n'hi ha, preval sobre el REGULAR).
 *   3. Diferència de jocs (tots els partits del grup).
 *   4. Diferència de sets.
 *   5. Empat de 3 o més: mini-lligueta amb els partits ja jugats entre elles (punts → jocs → sets).
 *   6. Si persisteix: ordre del coordinador (partit extra o decisió); si no n'hi ha, es marca l'empat.
 * Cada vegada que un criteri divideix el grup empatat, els subgrups es tornen a resoldre des del pas 2.
 */
export function computeStandings(input: StandingsInput): StandingRow[] {
  const ids = new Set(input.entries);
  const regular = input.matches.filter((m) => m.purpose === "REGULAR");
  const tiebreakMatches = input.matches.filter((m) => m.purpose === "TIEBREAK");
  const stats = accumulate(ids, regular);
  const st = (id: EntryId) => stats.get(id)!;

  const decidedBy = new Map<EntryId, TiebreakCriterion>();
  const unresolved = new Map<EntryId, EntryId[]>();

  const headToHead = (x: EntryId, y: EntryId): EntryId | undefined => {
    const between = (m: CompletedMatch) =>
      (m.entryA === x && m.entryB === y) || (m.entryA === y && m.entryB === x);
    const m = tiebreakMatches.filter(between).at(-1) ?? regular.filter(between).at(-1);
    if (!m) return undefined;
    return matchWinner(m) === "A" ? m.entryA : m.entryB;
  };

  const resolve = (tied: EntryId[]): EntryId[] => {
    if (tied.length === 1) return tied;

    if (tied.length === 2) {
      const winner = headToHead(tied[0]!, tied[1]!);
      if (winner) {
        const loser = winner === tied[0] ? tied[1]! : tied[0]!;
        decidedBy.set(winner, "HEAD_TO_HEAD");
        decidedBy.set(loser, "HEAD_TO_HEAD");
        return [winner, loser];
      }
    }

    const splitters: [TiebreakCriterion, (id: EntryId) => number[]][] = [
      ["GAME_DIFFERENCE", (id) => [st(id).gamesWon - st(id).gamesLost]],
      ["SET_DIFFERENCE", (id) => [st(id).setsWon - st(id).setsLost]],
    ];
    if (tied.length >= 3) {
      const mini = accumulate(new Set(tied), regular);
      splitters.push([
        "MINI_LEAGUE",
        (id) => {
          const s = mini.get(id)!;
          return [s.points, s.gamesWon - s.gamesLost, s.setsWon - s.setsLost];
        },
      ]);
    }

    for (const [criterion, key] of splitters) {
      const buckets = bucketBy(tied, key);
      if (buckets.length > 1) {
        for (const id of tied) decidedBy.set(id, criterion);
        return buckets.flatMap(resolve);
      }
    }

    const order = input.coordinatorOrder;
    if (order && tied.every((id) => order.includes(id))) {
      for (const id of tied) decidedBy.set(id, "COORDINATOR");
      return [...tied].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    for (const id of tied) unresolved.set(id, tied.filter((o) => o !== id));
    return [...tied].sort();
  };

  const ordered = bucketBy([...ids], (id) => [st(id).points]).flatMap(resolve);

  const rows: StandingRow[] = [];
  ordered.forEach((id, i) => {
    const s = st(id);
    const prev = rows[i - 1];
    const tiedWithPrev = prev !== undefined && unresolved.get(id)?.includes(prev.entryId);
    const row: StandingRow = {
      entryId: id,
      position: tiedWithPrev ? prev.position : i + 1,
      ...s,
      gameDifference: s.gamesWon - s.gamesLost,
      setDifference: s.setsWon - s.setsLost,
    };
    const d = decidedBy.get(id);
    if (d) row.decidedBy = d;
    const u = unresolved.get(id);
    if (u) row.unresolvedTieWith = u;
    rows.push(row);
  });
  return rows;
}
