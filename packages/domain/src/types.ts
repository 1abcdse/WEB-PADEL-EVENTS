export type EntryId = string;
export type PlayerId = string;

/** Resultat d'un set, orientat a (parella A, parella B). */
export interface SetScore {
  a: number;
  b: number;
  /** Super tie-break a 10 punts, només quan el set arriba a 6-6 (resultat final 7-6). */
  tieBreak?: { a: number; b: number };
}

/**
 * Final per límit horari (23:00). `sets` conté només els sets acabats; el set en joc queda a
 * `partialSet` (els seus jocs compten, però no com a set) i el super tie-break decideix el partit.
 */
export interface TimeLimitFinish {
  partialSet?: { a: number; b: number };
  superTieBreak: { a: number; b: number };
}

export type MatchPurpose = "REGULAR" | "TIEBREAK" | "PLAYOFF";

/** Partit amb resultat registrat (jugat o WO confirmat). */
export interface CompletedMatch {
  id: string;
  purpose: MatchPurpose;
  entryA: EntryId;
  entryB: EntryId;
  outcome: "PLAYED" | "WALKOVER";
  /** En un WO, el resultat virtual 6-0 / 6-0 (vegeu `walkoverSets`). */
  sets: SetScore[];
  /** Partit no acabat a les 23:00: es decideix amb un super tie-break a 10 (vegeu `scoring.ts`). */
  timeLimit?: TimeLimitFinish;
  /** Jugadors que realment han jugat (suplents inclosos). Si no hi és, s'agafen els titulars. */
  lineupA?: readonly [PlayerId, PlayerId];
  lineupB?: readonly [PlayerId, PlayerId];
}

export type Side = "A" | "B";
