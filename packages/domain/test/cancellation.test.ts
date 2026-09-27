import { describe, expect, it } from "vitest";
import { CANCELLATION_POLICY_2026_27, FEES_2026_27, evaluateCancellation, matchCharges } from "../src/index.js";

const match = { id: "m1", entryA: "A", entryB: "B" };
const cancel = (by: string, cancelledAt = "2026-10-12T10:00:00+02:00") => ({
  matchId: "m1",
  cancelledBy: by,
  cancelledAt,
  matchStartsAt: "2026-10-14T21:00:00+02:00",
});

describe("evaluateCancellation", () => {
  it("1a i 2a cancel·lació amb ≥24 h: avís; 3a: WO per a la rival i cobrament a qui cancel·la", () => {
    const p = CANCELLATION_POLICY_2026_27;
    expect(evaluateCancellation(p, match, [], cancel("A"))).toEqual({ kind: "WARNING", warningNumber: 1, of: 3 });
    expect(evaluateCancellation(p, match, [cancel("A")], cancel("A"))).toMatchObject({ warningNumber: 2 });
    expect(evaluateCancellation(p, match, [cancel("A"), cancel("A")], cancel("A"))).toEqual({
      kind: "WALKOVER",
      reason: "REPEATED_CANCELLATIONS",
      winner: "B",
      chargedEntry: "A",
    });
  });

  it("les cancel·lacions de la rival no sumen a l'altra parella", () => {
    const r = evaluateCancellation(CANCELLATION_POLICY_2026_27, match, [cancel("B"), cancel("B")], cancel("A"));
    expect(r).toMatchObject({ kind: "WARNING", warningNumber: 1 });
  });

  it("2026/27: una cancel·lació amb menys de 24 h no és WO directe, compta com una més", () => {
    const late = cancel("B", "2026-10-14T09:00:00+02:00");
    const p = CANCELLATION_POLICY_2026_27;
    expect(evaluateCancellation(p, match, [], late)).toMatchObject({ kind: "WARNING", warningNumber: 1 });
    expect(evaluateCancellation(p, match, [cancel("B"), cancel("B")], late)).toMatchObject({
      kind: "WALKOVER",
      reason: "REPEATED_CANCELLATIONS",
      winner: "A",
    });
  });

  it("la política també admet el WO directe per cancel·lació tardana (configurable)", () => {
    const policy = { ...CANCELLATION_POLICY_2026_27, lateCancellation: "WALKOVER" as const };
    const r = evaluateCancellation(policy, match, [], cancel("B", "2026-10-14T09:00:00+02:00"));
    expect(r).toMatchObject({ kind: "WALKOVER", reason: "LATE_CANCELLATION", winner: "A" });
  });
});

describe("matchCharges", () => {
  const lineups = { A: ["marc", "joan"], B: ["pere", "suplent"] };
  const member = (p: string) => p === "marc" || p === "pere";

  it("partit jugat: paguen els 4, suplent inclòs (1 € abonat, 5 € no abonat)", () => {
    expect(matchCharges(FEES_2026_27, lineups, member, { kind: "PLAYED" })).toEqual([
      { playerId: "marc", amountCents: 100 },
      { playerId: "joan", amountCents: 500 },
      { playerId: "pere", amountCents: 100 },
      { playerId: "suplent", amountCents: 500 },
    ]);
  });

  it("no presentació: només paguen els absents", () => {
    const c = matchCharges(FEES_2026_27, lineups, member, { kind: "NO_SHOW", absentEntry: "B" });
    expect(c.map((x) => x.playerId)).toEqual(["pere", "suplent"]);
  });

  it("WO per cancel·lacions: paguen els que han cancel·lat", () => {
    const c = matchCharges(FEES_2026_27, lineups, member, { kind: "CANCELLATION_WALKOVER", chargedEntry: "A" });
    expect(c.map((x) => x.playerId)).toEqual(["marc", "joan"]);
  });
});
