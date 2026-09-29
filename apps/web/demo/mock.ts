/**
 * Lliga simulada per a la demo: mateixes regles que l'API (paquet de domini), però en memòria
 * i amb noms inventats. Mai dades reals d'inscrits.
 */
import {
  CALENDAR_2026_27,
  CANCELLATION_POLICY_2026_27,
  computePlayerRanking,
  computeStandings,
  evaluateCancellation,
  generateRoundRobin,
  slotsForWeek,
  validateBooking,
  validateMatchSets,
  walkoverSets,
  type Cancellation,
  type CompletedMatch,
  type SetScore,
  type TimeLimitFinish,
} from "../../../packages/domain/src/index";
import type { MatchStatus, MatchView } from "@/lib/api";
import type { CompetitionDetail, DivisionSummary, PlayerRankingRow, StandingRow } from "@/lib/public-api";

const FIRST_WEEK = "2026-10-12";
const TZ = "Europe/Madrid";

function offsetMs(instant: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) -
    Math.floor(instant.getTime() / 1000) * 1000;
}
export function localToInstant(date: string, time: string) {
  const naive = new Date(`${date}T${time}:00Z`);
  const first = new Date(naive.getTime() - offsetMs(naive));
  return new Date(naive.getTime() - offsetMs(first));
}
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

interface Player {
  id: string;
  first: string;
  last: string;
}
interface Entry {
  id: string;
  divisionId: string;
  players: [Player, Player];
}
interface Booking {
  date: string;
  start: string;
  court: number;
  status: "PROPOSED" | "CONFIRMED";
  proposedBy: string;
  requiresApproval: boolean;
  approved: boolean;
}
interface Result {
  outcome: "PLAYED" | "WALKOVER";
  sets: SetScore[];
  timeLimit?: TimeLimitFinish;
  reportedBy: string | null;
  confirmed: boolean;
}
interface Match {
  id: string;
  divisionId: string;
  groupId: string;
  round: number;
  week: string;
  entryA: string;
  entryB: string;
  status: MatchStatus;
  walkoverReason: string | null;
  booking: Booking | null;
  result: Result | null;
}

interface DivisionDef {
  id: string;
  category: string;
  categoryCode: string;
  level: string;
  levelCode: string;
  schedule: "WEEKDAY" | "WEEKEND";
  pendingEntries?: number;
}

const DIVISIONS: DivisionDef[] = [
  { id: "fem-c", category: "Femenina", categoryCode: "FEMENINA", level: "Nivell C", levelCode: "C", schedule: "WEEKDAY" },
  { id: "mixta", category: "Mixta", categoryCode: "MIXTA", level: "Nivell únic", levelCode: "U", schedule: "WEEKEND" },
  { id: "masc-c", category: "Masculina", categoryCode: "MASCULINA", level: "Nivell C", levelCode: "C", schedule: "WEEKDAY", pendingEntries: 4 },
  { id: "masc-b", category: "Masculina", categoryCode: "MASCULINA", level: "Nivell B", levelCode: "B", schedule: "WEEKDAY", pendingEntries: 2 },
  { id: "fem-b", category: "Femenina", categoryCode: "FEMENINA", level: "Nivell B", levelCode: "B", schedule: "WEEKDAY", pendingEntries: 2 },
];

// Noms inventats.
const FEM: [string, string, string, string][] = [
  ["Núria", "Casals", "Montse", "Ribas"],
  ["Carla", "Vendrell", "Judit", "Pujol"],
  ["Berta", "Sala", "Aina", "Comas"],
  ["Ona", "Bertran", "Clara", "Mestres"],
  ["Rut", "Solà", "Marta", "Gil"],
  ["Irene", "Prat", "Sílvia", "Costa"],
];
const MIX: [string, string, string, string][] = [
  ["Laia", "Ferrer", "Pol", "Roig"],
  ["Jana", "Soler", "Arnau", "Mir"],
  ["Paula", "Vidal", "Biel", "Serra"],
  ["Emma", "Pons", "Nil", "Camps"],
  ["Mar", "Font", "Àlex", "Riera"],
  ["Lia", "Molins", "Jan", "Coll"],
];

const pairName = (e: Entry) => e.players.map((p) => `${p.first} ${p.last}`).join(" / ");

export class DemoLeague {
  entries = new Map<string, Entry>();
  matches: Match[] = [];
  cancellations: (Cancellation & { kind: "CANCEL" | "REJECT" })[] = [];
  now: () => Date;

  constructor(now: () => Date) {
    this.now = now;
    const build = (divisionId: string, rows: typeof FEM, prefix: string) => {
      const ids: string[] = [];
      rows.forEach(([f1, l1, f2, l2], i) => {
        const id = `${prefix}${i + 1}`;
        this.entries.set(id, {
          id,
          divisionId,
          players: [
            { id: `${id}a`, first: f1, last: l1 },
            { id: `${id}b`, first: f2, last: l2 },
          ],
        });
        ids.push(id);
      });
      for (const round of generateRoundRobin(ids))
        round.matches.forEach((m, k) =>
          this.matches.push({
            id: `${prefix}-j${round.number}-${k + 1}`,
            divisionId,
            groupId: `g-${divisionId}`,
            round: round.number,
            week: addDays(FIRST_WEEK, (round.number - 1) * 7),
            entryA: m.entryA,
            entryB: m.entryB,
            status: "UNSCHEDULED",
            walkoverReason: null,
            booking: null,
            result: null,
          }),
        );
    };
    build("fem-c", FEM, "f");
    build("mixta", MIX, "x");

    // Punt de partida realista: dimecres 14/10.
    const at = (id: string) => this.matches.find((m) => m.id === id)!;
    const book = (m: Match, date: string, start: string, court: number, by: string, confirmed: boolean) => {
      m.booking = { date, start, court, status: confirmed ? "CONFIRMED" : "PROPOSED", proposedBy: by, requiresApproval: false, approved: false };
      m.status = confirmed ? "SCHEDULED" : "PROPOSED";
    };
    const j1 = at("f-j1-1");
    book(j1, "2026-10-13", "21:00", 1, j1.entryA, true);
    j1.result = { outcome: "PLAYED", sets: [{ a: 6, b: 4 }, { a: 3, b: 6 }, { a: 7, b: 5 }], reportedBy: j1.entryA, confirmed: true };
    j1.status = "PLAYED";
    book(at("f-j1-2"), "2026-10-14", "21:00", 2, at("f-j1-2").entryB, true);
    book(at("f-j1-3"), "2026-10-16", "21:00", 1, at("f-j1-3").entryA, false);
    book(at("x-j1-1"), "2026-10-17", "10:30", 1, at("x-j1-1").entryA, true);
    book(at("x-j1-3"), "2026-10-18", "12:00", 3, at("x-j1-3").entryB, false);
  }

  pairs() {
    return [...this.entries.values()].map((e) => ({
      id: e.id,
      name: pairName(e),
      division: DIVISIONS.find((d) => d.id === e.divisionId)!,
    }));
  }

  // --- Vistes -------------------------------------------------------------

  private view(m: Match): MatchView {
    const a = this.entries.get(m.entryA)!;
    const b = this.entries.get(m.entryB)!;
    return {
      id: m.id,
      purpose: "REGULAR",
      playoffCode: null,
      round: m.round,
      week: m.week,
      divisionId: m.divisionId,
      group: "A",
      status: m.status,
      walkoverReason: m.walkoverReason,
      entryA: { id: a.id, name: pairName(a) },
      entryB: { id: b.id, name: pairName(b) },
      booking: m.booking && {
        date: m.booking.date,
        start: m.booking.start,
        court: m.booking.court,
        status: m.booking.status,
        proposedBy: m.booking.proposedBy,
        awaitingApproval: m.booking.requiresApproval && !m.booking.approved,
      },
      result: m.result && {
        sets: m.result.sets,
        timeLimit: m.result.timeLimit ?? null,
        confirmed: m.result.confirmed,
        reportedBy: m.result.reportedBy,
      },
    };
  }

  private completed(divisionId: string): CompletedMatch[] {
    return this.matches
      .filter((m) => m.divisionId === divisionId && (m.status === "PLAYED" || m.status === "WALKOVER") && m.result)
      .map((m) => {
        const c: CompletedMatch = {
          id: m.id,
          purpose: "REGULAR",
          entryA: m.entryA,
          entryB: m.entryB,
          outcome: m.result!.outcome,
          sets: m.result!.sets,
        };
        if (m.result!.timeLimit) c.timeLimit = m.result!.timeLimit;
        return c;
      });
  }

  competition(): CompetitionDetail {
    return {
      id: "demo",
      name: "Prova 1 (Oct–Des 2026)",
      status: "ACTIVE",
      first_week: FIRST_WEEK,
      group_size: 6,
      divisions: DIVISIONS.map((d): DivisionSummary => {
        const open = !d.pendingEntries;
        return {
          division_id: d.id,
          category_code: d.categoryCode,
          category: d.category,
          level_code: d.levelCode,
          level: d.level,
          schedule: d.schedule,
          entries: open ? 6 : d.pendingEntries!,
          groups: open ? [{ id: `g-${d.id}`, code: "A" }] : [],
          first_week: open ? FIRST_WEEK : null,
          status: open ? "OPEN" : "PENDING",
          missingPairs: open ? 0 : 6 - d.pendingEntries!,
        };
      }),
    };
  }

  standings(divisionId: string): StandingRow[] {
    const entries = [...this.entries.values()].filter((e) => e.divisionId === divisionId);
    return computeStandings({ entries: entries.map((e) => e.id), matches: this.completed(divisionId) }).map((r) => ({
      ...r,
      name: pairName(this.entries.get(r.entryId)!),
    }));
  }

  groupMatches(divisionId: string) {
    return this.matches.filter((m) => m.divisionId === divisionId).map((m) => this.view(m));
  }

  ranking(divisionId: string): PlayerRankingRow[] {
    const entryPlayers = new Map(
      [...this.entries.values()]
        .filter((e) => e.divisionId === divisionId)
        .map((e) => [e.id, [e.players[0].id, e.players[1].id] as const]),
    );
    const names = new Map([...this.entries.values()].flatMap((e) => e.players.map((p) => [p.id, `${p.first} ${p.last}`])));
    return computePlayerRanking({ entryPlayers, matches: this.completed(divisionId) }).map((r) => ({
      ...r,
      name: names.get(r.playerId) ?? "",
    }));
  }

  agenda(week: string) {
    return this.matches
      .filter((m) => m.week === week && m.booking?.status === "CONFIRMED")
      .map((m) => this.view(m));
  }

  // --- API de parella (mateixes regles que apps/api) ------------------------

  private fail(status: number, code: string): never {
    throw Object.assign(new Error(code), { status, code });
  }

  private match(entryId: string, matchId: string) {
    const m = this.matches.find((x) => x.id === matchId);
    if (!m) this.fail(404, "NOT_FOUND");
    if (m.entryA !== entryId && m.entryB !== entryId) this.fail(403, "FORBIDDEN");
    return m;
  }

  private players(m: Match) {
    return [m.entryA, m.entryB].flatMap((e) => this.entries.get(e)!.players.map((p) => p.id));
  }

  private existing(dates: string[]) {
    return this.matches
      .filter((m) => m.booking && dates.includes(m.booking.date))
      .map((m) => ({
        matchId: m.id,
        slot: { date: m.booking!.date, start: m.booking!.start, court: m.booking!.court },
        players: this.players(m),
      }));
  }

  private schedule(m: Match) {
    return DIVISIONS.find((d) => d.id === m.divisionId)!.schedule;
  }

  me(entryId: string) {
    const e = this.entries.get(entryId);
    if (!e) this.fail(401, "UNAUTHORIZED");
    const d = DIVISIONS.find((x) => x.id === e.divisionId)!;
    return {
      entryId,
      name: pairName(e),
      category: d.category,
      level: d.level,
      group_id: `g-${d.id}`,
      matches: this.matches.filter((m) => m.entryA === entryId || m.entryB === entryId).map((m) => this.view(m)),
    };
  }

  slots(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    const slots = slotsForWeek(CALENDAR_2026_27, this.schedule(m), m.week);
    const existing = this.existing([...new Set(slots.map((s) => s.date))]);
    const players = this.players(m);
    return slots
      .filter((s) => localToInstant(s.date, s.start) > this.now())
      .filter(
        (s) => validateBooking(CALENDAR_2026_27, { matchId, schedule: this.schedule(m), roundWeek: m.week, players, slot: s }, existing).ok,
      )
      .map((s) => ({ date: s.date, start: s.start, court: s.court, requiresApproval: s.extra }));
  }

  propose(entryId: string, matchId: string, slot: { date: string; start: string; court: number }) {
    const m = this.match(entryId, matchId);
    if (m.status !== "UNSCHEDULED") this.fail(409, "MATCH_NOT_UNSCHEDULED");
    if (localToInstant(slot.date, slot.start) <= this.now()) this.fail(400, "SLOT_IN_THE_PAST");
    const v = validateBooking(
      CALENDAR_2026_27,
      { matchId, schedule: this.schedule(m), roundWeek: m.week, players: this.players(m), slot },
      this.existing([slot.date]),
    );
    if (!v.ok) this.fail(409, "BOOKING_CONFLICT");
    m.booking = { ...slot, status: "PROPOSED", proposedBy: entryId, requiresApproval: v.requiresCoordinatorApproval, approved: false };
    m.status = "PROPOSED";
    return { requiresApproval: v.requiresCoordinatorApproval };
  }

  confirm(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    if (m.booking?.status !== "PROPOSED") this.fail(409, "NO_PROPOSAL");
    if (m.booking.proposedBy === entryId) this.fail(403, "FORBIDDEN");
    m.booking.status = "CONFIRMED";
    m.status = m.booking.requiresApproval && !m.booking.approved ? "PROPOSED" : "SCHEDULED";
    return { status: m.status };
  }

  /** Demo: fa d'administrador i aprova les reserves de dijous pendents. */
  approveAll() {
    for (const m of this.matches)
      if (m.booking?.requiresApproval && !m.booking.approved) {
        m.booking.approved = true;
        if (m.booking.status === "CONFIRMED") m.status = "SCHEDULED";
      }
  }

  private cancellation(m: Match, entryId: string, kind: "CANCEL" | "REJECT") {
    const current = {
      matchId: m.id,
      cancelledBy: entryId,
      cancelledAt: this.now().toISOString(),
      matchStartsAt: localToInstant(m.booking!.date, m.booking!.start).toISOString(),
    };
    const outcome = evaluateCancellation(
      CANCELLATION_POLICY_2026_27,
      { id: m.id, entryA: m.entryA, entryB: m.entryB },
      this.cancellations.filter((c) => c.matchId === m.id),
      current,
    );
    this.cancellations.push({ ...current, kind });
    m.booking = null;
    if (outcome.kind === "WARNING") m.status = "UNSCHEDULED";
    else {
      m.result = {
        outcome: "WALKOVER",
        sets: walkoverSets(outcome.winner === m.entryA ? "A" : "B"),
        reportedBy: null,
        confirmed: true,
      };
      m.status = "WALKOVER";
      m.walkoverReason = outcome.reason;
    }
    return outcome;
  }

  reject(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    if (m.booking?.status !== "PROPOSED") this.fail(409, "NO_PROPOSAL");
    if (m.booking.proposedBy === entryId) {
      m.booking = null;
      m.status = "UNSCHEDULED";
      return { kind: "WITHDRAWN" };
    }
    return this.cancellation(m, entryId, "REJECT");
  }

  cancel(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    if (m.booking?.status !== "CONFIRMED") this.fail(409, "NOTHING_TO_CANCEL");
    if (localToInstant(m.booking.date, m.booking.start) <= this.now()) this.fail(409, "MATCH_STARTED");
    return this.cancellation(m, entryId, "CANCEL");
  }

  private started(m: Match) {
    return m.booking?.status === "CONFIRMED" && localToInstant(m.booking.date, m.booking.start) <= this.now();
  }

  noShow(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    if (m.status !== "SCHEDULED") this.fail(409, "MATCH_NOT_SCHEDULED");
    if (!this.started(m)) this.fail(409, "MATCH_NOT_STARTED");
    m.result = { outcome: "WALKOVER", sets: walkoverSets(m.entryA === entryId ? "A" : "B"), reportedBy: entryId, confirmed: true };
    m.status = "WALKOVER";
    m.walkoverReason = "NO_SHOW";
    return { ok: true };
  }

  report(entryId: string, matchId: string, body: { sets: SetScore[]; timeLimit?: TimeLimitFinish }) {
    const m = this.match(entryId, matchId);
    if (m.status !== "SCHEDULED") this.fail(409, "MATCH_NOT_SCHEDULED");
    if (!this.started(m)) this.fail(409, "MATCH_NOT_STARTED");
    if (!validateMatchSets(body.sets, body.timeLimit).ok) this.fail(400, "INVALID_RESULT");
    m.result = { outcome: "PLAYED", sets: body.sets, reportedBy: entryId, confirmed: false };
    if (body.timeLimit) m.result.timeLimit = body.timeLimit;
    m.status = "RESULT_PENDING";
    return { ok: true };
  }

  confirmResult(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    if (m.status !== "RESULT_PENDING") this.fail(409, "NO_PENDING_RESULT");
    if (m.result!.reportedBy === entryId) this.fail(403, "FORBIDDEN");
    m.result!.confirmed = true;
    m.status = "PLAYED";
    return { ok: true };
  }

  dispute(entryId: string, matchId: string) {
    const m = this.match(entryId, matchId);
    if (m.status !== "RESULT_PENDING") this.fail(409, "NO_PENDING_RESULT");
    if (m.result!.reportedBy === entryId) this.fail(403, "FORBIDDEN");
    m.result = null;
    m.status = "SCHEDULED";
    return { ok: true };
  }

  /** Substitut de `fetch` per a les crides de la pantalla de parella (`/api/entry/...`). */
  async handle(url: string, init?: RequestInit): Promise<Response> {
    const token = new Headers(init?.headers).get("x-entry-token") ?? "";
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const path = url.replace(/^\/api\/entry/, "");
    const json = (status: number, data: unknown) =>
      new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
    try {
      if (path === "/me") return json(200, this.me(token));
      const r = /^\/matches\/([^/]+)\/(.+)$/.exec(path);
      if (!r) return json(404, { code: "NOT_FOUND" });
      const [, id, action] = r as unknown as [string, string, string];
      const actions: Record<string, () => unknown> = {
        slots: () => this.slots(token, id),
        proposal: () => this.propose(token, id, body),
        confirm: () => this.confirm(token, id),
        reject: () => this.reject(token, id),
        cancel: () => this.cancel(token, id),
        "no-show": () => this.noShow(token, id),
        result: () => this.report(token, id, body),
        "result/confirm": () => this.confirmResult(token, id),
        "result/dispute": () => this.dispute(token, id),
      };
      const fn = actions[action];
      if (!fn) return json(404, { code: "NOT_FOUND" });
      return json(action === "proposal" ? 201 : 200, fn());
    } catch (err) {
      const e = err as { status?: number; code?: string; message: string };
      return json(e.status ?? 500, { code: e.code ?? "INTERNAL", message: e.message });
    }
  }
}
