import { describe, expect, it } from "vitest";
import { computeStandings } from "../src/index.js";
import { played, walkover } from "./helpers.js";

const order = (rows: { entryId: string }[]) => rows.map((r) => r.entryId);

describe("computeStandings", () => {
  it("ordena per punts i calcula totals", () => {
    const rows = computeStandings({
      entries: ["A", "B", "C"],
      matches: [played("A", "B", "6-2 6-2"), played("A", "C", "6-4 3-6 6-4"), played("C", "B", "6-1 6-1")],
    });
    expect(order(rows)).toEqual(["A", "C", "B"]);
    expect(rows[0]).toMatchObject({ points: 6, won: 2, played: 2, position: 1 });
    expect(rows[1]).toMatchObject({ points: 4 }); // 3 (victòria) + 1 (derrota amb set)
    expect(rows[2]).toMatchObject({ points: 0, position: 3 });
  });

  it("empat net de 2 parelles: enfrontament directe", () => {
    const rows = computeStandings({
      entries: ["A", "B", "C", "D"],
      matches: [
        played("A", "B", "7-5 7-6(10-8)"), // A guanya el directe per poc
        played("C", "A", "6-0 6-0"),
        played("D", "A", "6-4 4-6 6-4"), // A perd amb un set a favor → 1 punt
        played("C", "B", "6-4 4-6 6-4"), // B perd amb un set a favor → 1 punt
        played("B", "D", "6-0 6-0"),
        played("C", "D", "6-0 6-0"),
      ],
    });
    // C 9 punts; A i B 4 punts (B +7 jocs, A -11: B té molt millor diferència); D 3.
    expect(order(rows)).toEqual(["C", "A", "B", "D"]);
    expect(rows[1]).toMatchObject({ entryId: "A", decidedBy: "HEAD_TO_HEAD" });
  });

  it("un partit de desempat (TIEBREAK) preval sobre el directe de lliga", () => {
    const rows = computeStandings({
      entries: ["A", "B", "C", "D"],
      matches: [
        played("A", "B", "6-4 6-4"), // A guanya el directe de lliga...
        played("C", "A", "6-0 6-0"),
        played("B", "D", "6-0 6-0"),
        played("C", "D", "6-0 6-0"),
        played("B", "A", "6-3 6-3", "TIEBREAK"), // ...però B guanya el partit de desempat
      ],
    });
    expect(order(rows)).toEqual(["C", "B", "A", "D"]);
    expect(rows[1]).toMatchObject({ points: 3, played: 2, decidedBy: "HEAD_TO_HEAD" });
  });

  it("empat de 3: diferència de jocs", () => {
    // Triangle A>B, B>C, C>A, tots 3 punts; D perd tot.
    const rows = computeStandings({
      entries: ["A", "B", "C", "D"],
      matches: [
        played("A", "B", "6-0 6-0"),
        played("B", "C", "6-3 6-3"),
        played("C", "A", "6-4 6-4"),
        played("D", "A", "0-6 0-6"),
        played("D", "B", "0-6 0-6"),
        played("D", "C", "0-6 0-6"),
      ],
    });
    // Jocs: A +12-4+... calculem: A: 12-0, 8-12, 12-0 → +20 ; B: 0-12, 12-6, 12-0 → +6 ; C: 6-12, 12-8, 12-0 → +10
    expect(order(rows)).toEqual(["A", "C", "B", "D"]);
    expect(rows[0]!.decidedBy).toBe("GAME_DIFFERENCE");
  });

  it("empat de 3 que la diferència de jocs parteix en 1+2: els 2 restants van al directe", () => {
    const rows = computeStandings({
      entries: ["A", "B", "C", "D"],
      matches: [
        played("A", "B", "6-0 6-0"),
        played("B", "C", "6-4 6-4"),
        played("C", "A", "6-4 6-4"),
        played("A", "D", "6-0 6-0"),
        played("B", "D", "6-0 6-0"),
        played("C", "D", "6-4 6-4"),
      ],
    });
    // A, B, C a 6 punts. A +20 jocs; B i C +4 jocs i +2 sets → directe: B va guanyar C.
    expect(order(rows)).toEqual(["A", "B", "C", "D"]);
    expect(rows[0]!.decidedBy).toBe("GAME_DIFFERENCE");
    expect(rows[1]!.decidedBy).toBe("HEAD_TO_HEAD");
  });

  it("empat total de 3 (punts, jocs, sets i mini-lligueta): queda marcat sense resoldre", () => {
    const rows = computeStandings({
      entries: ["A", "B", "C"],
      matches: [played("A", "B", "6-4 6-4"), played("B", "C", "6-4 6-4"), played("C", "A", "6-4 6-4")],
    });
    expect(rows.every((r) => r.position === 1)).toBe(true);
    expect(rows[0]!.unresolvedTieWith).toHaveLength(2);
  });

  it("empat irresoluble: s'aplica l'ordre del coordinador", () => {
    const matches = [played("A", "B", "6-4 6-4"), played("B", "C", "6-4 6-4"), played("C", "A", "6-4 6-4")];
    const rows = computeStandings({ entries: ["A", "B", "C"], matches, coordinatorOrder: ["B", "C", "A"] });
    expect(order(rows)).toEqual(["B", "C", "A"]);
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3]);
    expect(rows[0]!.decidedBy).toBe("COORDINATOR");
  });

  it("un WO compta com 6-0 6-0 a la diferència de jocs", () => {
    const rows = computeStandings({ entries: ["A", "B"], matches: [walkover("A", "B", "A")] });
    expect(rows[0]).toMatchObject({ entryId: "A", points: 3, gamesWon: 12, gamesLost: 0 });
    expect(rows[1]).toMatchObject({ entryId: "B", points: 0 });
  });

  it("els partits de playoff no compten a la classificació de grup", () => {
    const rows = computeStandings({
      entries: ["A", "B"],
      matches: [played("A", "B", "6-4 6-4"), played("B", "A", "6-0 6-0", "PLAYOFF")],
    });
    expect(rows[0]).toMatchObject({ entryId: "A", points: 3, played: 1 });
  });
});
