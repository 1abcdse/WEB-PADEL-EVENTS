import type { EntryId, PlayerId } from "./types.js";

export interface Fees {
  /** Cèntims per partit jugat. */
  matchMember: number;
  matchNonMember: number;
}

export type MatchChargeReason =
  | { kind: "PLAYED" }
  | { kind: "NO_SHOW"; absentEntry: EntryId }
  | { kind: "CANCELLATION_WALKOVER"; chargedEntry: EntryId };

export interface MatchCharge {
  playerId: PlayerId;
  amountCents: number;
}

/**
 * Cobraments d'un partit:
 * - Jugat: tots els jugadors (suplents inclosos) paguen el partit.
 * - No presentació: només paguen els jugadors absents; la parella present no paga.
 * - WO per cancel·lacions (a la 3a): paguen els jugadors de la parella que ha cancel·lat.
 * Els avisos de cancel·lació previs no generen cap cobrament.
 */
export function matchCharges(
  fees: Fees,
  lineups: Readonly<Record<EntryId, readonly PlayerId[]>>,
  isMember: (player: PlayerId) => boolean,
  reason: MatchChargeReason,
): MatchCharge[] {
  const payers =
    reason.kind === "PLAYED"
      ? Object.values(lineups).flat()
      : [...(lineups[reason.kind === "NO_SHOW" ? reason.absentEntry : reason.chargedEntry] ?? [])];
  return payers.map((playerId) => ({
    playerId,
    amountCents: isMember(playerId) ? fees.matchMember : fees.matchNonMember,
  }));
}
