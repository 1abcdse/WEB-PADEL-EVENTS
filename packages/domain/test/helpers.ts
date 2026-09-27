import type { CompletedMatch, MatchPurpose, SetScore } from "../src/index.js";
import { walkoverSets } from "../src/index.js";

let seq = 0;
/** "6-4 3-6 7-6(10-8)" → sets orientats a A. */
export function parseSets(score: string): SetScore[] {
  return score.split(" ").map((s) => {
    const m = /^(\d+)-(\d+)(?:\((\d+)-(\d+)\))?$/.exec(s);
    if (!m) throw new Error(`bad score ${s}`);
    const set: SetScore = { a: Number(m[1]), b: Number(m[2]) };
    if (m[3]) set.tieBreak = { a: Number(m[3]), b: Number(m[4]) };
    return set;
  });
}

export function played(a: string, b: string, score: string, purpose: MatchPurpose = "REGULAR"): CompletedMatch {
  return { id: `m${++seq}`, purpose, entryA: a, entryB: b, outcome: "PLAYED", sets: parseSets(score) };
}

export function walkover(a: string, b: string, winner: "A" | "B"): CompletedMatch {
  return { id: `m${++seq}`, purpose: "REGULAR", entryA: a, entryB: b, outcome: "WALKOVER", sets: walkoverSets(winner) };
}
