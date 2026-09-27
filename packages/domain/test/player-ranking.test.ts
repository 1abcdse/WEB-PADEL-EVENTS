import { describe, expect, it } from "vitest";
import { computePlayerRanking } from "../src/index.js";
import { played, walkover } from "./helpers.js";

const entryPlayers = new Map([
  ["A", ["marc", "joan"] as const],
  ["B", ["pere", "pau"] as const],
]);

describe("computePlayerRanking", () => {
  it("suma lliga regular i playoffs dins la divisió", () => {
    const rows = computePlayerRanking({
      entryPlayers,
      matches: [played("A", "B", "6-4 1-6 7-5"), played("A", "B", "6-2 6-2", "PLAYOFF")],
    });
    const marc = rows.find((r) => r.playerId === "marc")!;
    const pere = rows.find((r) => r.playerId === "pere")!;
    expect(marc).toMatchObject({ played: 2, won: 2, points: 6, gamesWon: 26, gamesLost: 19, position: 1 });
    expect(pere).toMatchObject({ played: 2, won: 0, points: 1, gamesWon: 19, gamesLost: 26 });
  });

  it("el suplent suma el partit que juga; el titular absent no", () => {
    const m = { ...played("A", "B", "6-3 6-3"), lineupA: ["marc", "suplent"] as const };
    const rows = computePlayerRanking({ entryPlayers, matches: [m] });
    expect(rows.map((r) => r.playerId)).toContain("suplent");
    expect(rows.map((r) => r.playerId)).not.toContain("joan");
  });

  it("jugadors empatats comparteixen posició", () => {
    const rows = computePlayerRanking({ entryPlayers, matches: [walkover("A", "B", "A")] });
    expect(rows.slice(0, 2).map((r) => r.position)).toEqual([1, 1]);
    expect(rows[2]!.position).toBe(3);
  });
});
