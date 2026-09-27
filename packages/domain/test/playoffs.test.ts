import { describe, expect, it } from "vitest";
import { computeStandings, generateRoundRobin, resolvePlayoffs } from "../src/index.js";
import { played } from "./helpers.js";

// Grup de 6 on guanya sempre la parella de número més baix → classificació P1..P6.
const entries = ["P1", "P2", "P3", "P4", "P5", "P6"];
const matches = generateRoundRobin(entries).flatMap((r) =>
  r.matches.map((m) => (m.entryA < m.entryB ? played(m.entryA, m.entryB, "6-3 6-3") : played(m.entryA, m.entryB, "3-6 3-6"))),
);

describe("resolvePlayoffs", () => {
  const standings = computeStandings({ entries, matches });

  it("semis 1v4 i 2v3, consolació 5v6, final pendent", () => {
    expect(resolvePlayoffs(standings)).toEqual([
      { code: "SF1", bracket: "MAIN", round: 1, entryA: "P1", entryB: "P4" },
      { code: "SF2", bracket: "MAIN", round: 1, entryA: "P2", entryB: "P3" },
      { code: "CF", bracket: "CONSOLATION", round: 1, entryA: "P5", entryB: "P6" },
      { code: "F", bracket: "MAIN", round: 2 },
    ]);
  });

  it("la final s'omple amb els guanyadors de les semis", () => {
    const final = resolvePlayoffs(standings, {
      SF1: played("P1", "P4", "4-6 4-6", "PLAYOFF"),
      SF2: played("P2", "P3", "6-4 6-4", "PLAYOFF"),
    }).find((p) => p.code === "F");
    expect(final).toMatchObject({ entryA: "P4", entryB: "P2" });
  });

  it("amb un empat sense resoldre, cal decisió del coordinador", () => {
    const tied = computeStandings({
      entries: ["A", "B", "C"],
      matches: [played("A", "B", "6-4 6-4"), played("B", "C", "6-4 6-4"), played("C", "A", "6-4 6-4")],
    });
    expect(() => resolvePlayoffs(tied)).toThrow(/coordinator/);
  });
});
