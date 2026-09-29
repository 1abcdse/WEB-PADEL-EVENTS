import type { MatchView } from "./api";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function publicGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api/public${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return (await res.json()) as T;
}

export interface CompetitionSummary {
  id: string;
  slug: string;
  name: string;
  status: string;
  first_week: string;
  season: string;
}

export interface DivisionSummary {
  division_id: string;
  category_code: string;
  category: string;
  level_code: string;
  level: string;
  schedule: "WEEKDAY" | "WEEKEND";
  entries: number;
  groups: { id: string; code: string }[];
  first_week: string | null;
  status: "OPEN" | "PENDING";
  missingPairs: number;
}

export interface CompetitionDetail {
  id: string;
  name: string;
  status: string;
  first_week: string;
  group_size: number;
  divisions: DivisionSummary[];
}

export interface StandingRow {
  entryId: string;
  name: string;
  position: number;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  gameDifference: number;
  unresolvedTieWith?: string[];
}

export interface PlayerRankingRow {
  playerId: string;
  name: string;
  position: number;
  played: number;
  won: number;
  points: number;
  gamesWon: number;
  gamesLost: number;
  gameDifference: number;
}

export type PublicMatch = MatchView;

export async function currentCompetition(): Promise<CompetitionDetail | null> {
  const list = await publicGet<CompetitionSummary[]>("/competitions");
  if (!list[0]) return null;
  return publicGet<CompetitionDetail>(`/competitions/${list[0].id}`);
}

export const divisionName = (d: Pick<DivisionSummary, "category" | "level" | "level_code">) =>
  d.level_code === "U" ? d.category : `${d.category} · ${d.level}`;

export const scheduleLabel = (s: DivisionSummary["schedule"]) =>
  s === "WEEKEND" ? "Dissabtes i diumenges, de 9:00 a 19:30" : "Dimarts, dimecres i divendres a les 21:00";
