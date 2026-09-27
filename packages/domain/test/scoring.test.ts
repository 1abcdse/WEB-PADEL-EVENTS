import { describe, expect, it } from "vitest";
import { sideTotals, validateMatchSets, validateSet } from "../src/index.js";
import { parseSets, played, walkover } from "./helpers.js";

describe("validateSet", () => {
  it.each(["6-0", "6-4", "4-6", "7-5", "5-7", "7-6(10-8)", "6-7(12-14)"])("accepta %s", (s) => {
    expect(validateSet(parseSets(s)[0]!).ok).toBe(true);
  });
  it.each(["6-5", "7-4", "8-6", "7-6", "7-6(9-7)", "7-6(10-9)", "7-6(13-10)", "7-6(8-10)", "6-4(10-8)"])(
    "rebutja %s",
    (s) => expect(validateSet(parseSets(s)[0]!).ok).toBe(false),
  );
});

describe("validateMatchSets (millor de 3)", () => {
  it("2-0 en sets és vàlid", () => expect(validateMatchSets(parseSets("6-4 7-5")).ok).toBe(true));
  it("1-1 exigeix tercer set", () => expect(validateMatchSets(parseSets("6-4 1-6")).ok).toBe(false));
  it("1-1 + tercer set és vàlid", () => expect(validateMatchSets(parseSets("6-4 1-6 7-5")).ok).toBe(true));
  it("no hi pot haver tercer set si ja està decidit", () =>
    expect(validateMatchSets(parseSets("6-4 6-4 6-1")).ok).toBe(false));
});

describe("punts per partit", () => {
  it("victòria 3, derrota 0", () => {
    const m = played("A", "B", "6-4 6-3");
    expect(sideTotals(m, "A").points).toBe(3);
    expect(sideTotals(m, "B").points).toBe(0);
  });
  it("derrota amb un set a favor = 1 punt (6-4 / 1-6 / 7-5)", () => {
    const m = played("A", "B", "6-4 1-6 7-5");
    expect(sideTotals(m, "A")).toMatchObject({ points: 3, setsWon: 2, gamesWon: 14, gamesLost: 15 });
    expect(sideTotals(m, "B")).toMatchObject({ points: 1, setsWon: 1, gamesWon: 15, gamesLost: 14 });
  });
  it("el set de super tie-break compta 7-6 en jocs", () => {
    const m = played("A", "B", "7-6(10-7) 6-2");
    expect(sideTotals(m, "A")).toMatchObject({ gamesWon: 13, gamesLost: 8 });
  });
  it("WO: 3 punts i 6-0 6-0 per al perjudicat, 0 per a qui el provoca", () => {
    const m = walkover("A", "B", "B");
    expect(sideTotals(m, "B")).toMatchObject({ points: 3, gamesWon: 12, gamesLost: 0, setsWon: 2 });
    expect(sideTotals(m, "A")).toMatchObject({ points: 0, gamesWon: 0, gamesLost: 12 });
  });
});

describe("partit no acabat a les 23:00 (super tie-break a 10)", () => {
  const tl = (partial: [number, number] | null, stb: [number, number]) => ({
    ...(partial ? { partialSet: { a: partial[0], b: partial[1] } } : {}),
    superTieBreak: { a: stb[0], b: stb[1] },
  });

  it("valida sets acabats + set en joc + super tie-break", () => {
    expect(validateMatchSets(parseSets("6-4"), tl([3, 4], [10, 8])).ok).toBe(true);
    expect(validateMatchSets(parseSets("6-4 4-6"), tl([2, 2], [12, 10])).ok).toBe(true);
    expect(validateMatchSets(parseSets("6-4 6-4"), tl(null, [10, 8])).ok).toBe(false); // ja estava decidit
    expect(validateMatchSets(parseSets("6-4"), tl([6, 3], [10, 8])).ok).toBe(false); // el set en joc ja era acabat
    expect(validateMatchSets(parseSets("6-4"), tl([3, 4], [10, 9])).ok).toBe(false);
  });

  it("guanya qui guanya el super tie-break; compta com a set i com a joc 1-0", () => {
    const m = { ...played("A", "B", "4-6"), timeLimit: tl([4, 3], [10, 7]) };
    expect(sideTotals(m, "A")).toMatchObject({ won: true, points: 3, setsWon: 1, setsLost: 1, gamesWon: 9, gamesLost: 9 });
    expect(sideTotals(m, "B")).toMatchObject({ won: false, points: 1, setsWon: 1 });
  });
});
