import { describe, expect, it } from "vitest";
import { generateRoundRobin } from "../src/index.js";

const pairs = (n: number) => Array.from({ length: n }, (_, i) => `P${i + 1}`);

describe("generateRoundRobin", () => {
  it("6 parelles: ordre exacte de la taula de referència (ARCHITECTURE §2bis)", () => {
    const rounds = generateRoundRobin(pairs(6)).map((r) => r.matches.map((m) => `${m.entryA}-${m.entryB}`));
    expect(rounds).toEqual([
      ["P1-P6", "P2-P5", "P3-P4"],
      ["P1-P5", "P6-P4", "P2-P3"],
      ["P1-P4", "P5-P3", "P6-P2"],
      ["P1-P3", "P4-P2", "P5-P6"],
      ["P1-P2", "P3-P6", "P4-P5"],
    ]);
  });

  it.each([2, 3, 4, 5, 6, 7, 8])("N=%i: tothom contra tothom un sol cop, un partit per jornada", (n) => {
    const rounds = generateRoundRobin(pairs(n));
    const expectedRounds = n % 2 === 0 ? n - 1 : n;
    expect(rounds).toHaveLength(expectedRounds);
    const seen = new Set<string>();
    for (const r of rounds) {
      const busy = r.matches.flatMap((m) => [m.entryA, m.entryB]);
      if (r.bye) busy.push(r.bye);
      expect(new Set(busy).size).toBe(busy.length);
      expect(busy).toHaveLength(n);
      expect(Boolean(r.bye)).toBe(n % 2 === 1);
      for (const m of r.matches) {
        expect(m.entryA).not.toBe(m.entryB);
        seen.add([m.entryA, m.entryB].sort().join("|"));
      }
    }
    expect(seen.size).toBe((n * (n - 1)) / 2);
  });

  it("N imparell: cada parella descansa exactament una jornada", () => {
    const byes = generateRoundRobin(pairs(7)).map((r) => r.bye);
    expect(new Set(byes).size).toBe(7);
  });

  it("rebutja entrades invàlides", () => {
    expect(() => generateRoundRobin(["P1"])).toThrow();
    expect(() => generateRoundRobin(["P1", "P1"])).toThrow();
  });
});
