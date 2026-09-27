import type { EntryId } from "./types.js";

export interface CancellationPolicy {
  /** Cancel·lació número N del mateix enfrontament per la mateixa parella → WO a favor de la rival. */
  cancellationsForWalkover: number;
  /** Antelació mínima perquè una cancel·lació compti només com a avís. */
  minNoticeHours: number;
  /** Què passa amb una cancel·lació amb menys antelació. */
  lateCancellation: "WALKOVER" | "COUNTS_AS_CANCELLATION";
}

export interface Cancellation {
  matchId: string;
  cancelledBy: EntryId;
  /** Instants ISO 8601 amb zona horària. */
  cancelledAt: string;
  matchStartsAt: string;
}

export type CancellationOutcome =
  | { kind: "WARNING"; warningNumber: number; of: number }
  | {
      kind: "WALKOVER";
      reason: "REPEATED_CANCELLATIONS" | "LATE_CANCELLATION";
      winner: EntryId;
      /** Parella els jugadors de la qual paguen el partit. */
      chargedEntry: EntryId;
    };

/**
 * Decideix l'efecte d'una cancel·lació. Compta les cancel·lacions de la mateixa parella
 * en el mateix enfrontament: les primeres són avisos (sense cobrament) i la N-èsima és WO
 * per a la rival, amb cobrament del partit als jugadors que han cancel·lat.
 */
export function evaluateCancellation(
  policy: CancellationPolicy,
  match: { id: string; entryA: EntryId; entryB: EntryId },
  previous: readonly Cancellation[],
  cancellation: Cancellation,
): CancellationOutcome {
  const by = cancellation.cancelledBy;
  if (cancellation.matchId !== match.id) throw new Error("Cancellation does not belong to this match");
  if (by !== match.entryA && by !== match.entryB) throw new Error(`Entry ${by} does not play match ${match.id}`);
  const rival = by === match.entryA ? match.entryB : match.entryA;

  const noticeHours = (Date.parse(cancellation.matchStartsAt) - Date.parse(cancellation.cancelledAt)) / 3_600_000;
  if (noticeHours < policy.minNoticeHours && policy.lateCancellation === "WALKOVER")
    return { kind: "WALKOVER", reason: "LATE_CANCELLATION", winner: rival, chargedEntry: by };

  const count = previous.filter((c) => c.matchId === match.id && c.cancelledBy === by).length + 1;
  if (count >= policy.cancellationsForWalkover)
    return { kind: "WALKOVER", reason: "REPEATED_CANCELLATIONS", winner: rival, chargedEntry: by };
  return { kind: "WARNING", warningNumber: count, of: policy.cancellationsForWalkover };
}
