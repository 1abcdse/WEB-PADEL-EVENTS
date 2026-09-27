import { sideTotals } from "./scoring.js";
import type { CompletedMatch, EntryId, PlayerId } from "./types.js";

export interface PlayerRankingRow {
  playerId: PlayerId;
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
}

export interface PlayerRankingInput {
  /** Titulars de cada entry de la divisió (s'usen quan el partit no porta alineació). */
  entryPlayers: ReadonlyMap<EntryId, readonly [PlayerId, PlayerId]>;
  /**
   * Partits d'UNA sola divisió (categoria + nivell): lliga regular, desempats i playoffs.
   * El rànquing mai barreja divisions: un jugador a Masculina i a Mixta té dos rànquings separats.
   */
  matches: readonly CompletedMatch[];
}

/** Rànquing individual per divisió: punts → diferència de jocs → diferència de sets → jocs guanyats. */
export function computePlayerRanking(input: PlayerRankingInput): PlayerRankingRow[] {
  const rows = new Map<PlayerId, PlayerRankingRow>();
  const row = (id: PlayerId) => {
    let r = rows.get(id);
    if (!r) {
      r = {
        playerId: id, position: 0, played: 0, won: 0, lost: 0, points: 0,
        setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, gameDifference: 0, setDifference: 0,
      };
      rows.set(id, r);
    }
    return r;
  };

  for (const m of input.matches) {
    for (const side of ["A", "B"] as const) {
      const entry = side === "A" ? m.entryA : m.entryB;
      const lineup = (side === "A" ? m.lineupA : m.lineupB) ?? input.entryPlayers.get(entry);
      if (!lineup) throw new Error(`No players known for entry ${entry} in match ${m.id}`);
      const t = sideTotals(m, side);
      for (const p of lineup) {
        const r = row(p);
        r.played++;
        if (t.won) r.won++;
        else r.lost++;
        r.points += t.points;
        r.setsWon += t.setsWon;
        r.setsLost += t.setsLost;
        r.gamesWon += t.gamesWon;
        r.gamesLost += t.gamesLost;
      }
    }
  }

  const list = [...rows.values()];
  for (const r of list) {
    r.gameDifference = r.gamesWon - r.gamesLost;
    r.setDifference = r.setsWon - r.setsLost;
  }
  const key = (r: PlayerRankingRow) => [r.points, r.gameDifference, r.setDifference, r.gamesWon];
  const cmp = (a: PlayerRankingRow, b: PlayerRankingRow) => {
    const ka = key(a), kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i]! - ka[i]!;
    return 0;
  };
  list.sort((a, b) => cmp(a, b) || a.playerId.localeCompare(b.playerId));
  list.forEach((r, i) => {
    const prev = list[i - 1];
    r.position = prev && cmp(prev, r) === 0 ? prev.position : i + 1;
  });
  return list;
}
