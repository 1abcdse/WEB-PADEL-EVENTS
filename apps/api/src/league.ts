import { createHash, randomBytes } from "node:crypto";
import {
  addDays,
  isoWeekday,
  evaluateCancellation,
  computePlayerRanking,
  computeStandings,
  generateRoundRobin,
  matchCharges,
  resolvePlayoffs,
  slotsForWeek,
  validateBooking,
  validateMatchSets,
  walkoverSets,
  type CancellationPolicy,
  type CompletedMatch,
  type ExistingBooking,
  type Fees,
  type LeagueCalendar,
  type MatchChargeReason,
  type SetScore,
  type TimeLimitFinish,
} from "@padel/domain";
import type { Client } from "./db.js";
import { badRequest, conflict, forbidden, notFound } from "./errors.js";
import { nameWords } from "./import/registrations.js";
import { localToInstant } from "./time.js";

// ---------------------------------------------------------------------------
// Regles de la prova (competition.rules, congelades en activar-la)
// ---------------------------------------------------------------------------

export interface CompetitionRules {
  schedules: LeagueCalendar["schedules"];
  cancellation: CancellationPolicy;
  fees: Fees & { registrationMember: number; registrationNonMember: number };
  groupSize: number;
}

export type Actor = { kind: "admin" } | { kind: "entry"; entryId: string } | { kind: "system" };

const actorLabel = (a: Actor) => (a.kind === "entry" ? `entry:${a.entryId}` : a.kind);

export async function audit(c: Client, actor: Actor, entity: string, entityId: string | null, action: string, data?: unknown) {
  await c.query("INSERT INTO audit_log (actor, entity, entity_id, action, data) VALUES ($1, $2, $3, $4, $5)", [
    actorLabel(actor),
    entity,
    entityId,
    action,
    data === undefined ? null : JSON.stringify(data),
  ]);
}

// ---------------------------------------------------------------------------
// Noms públics (RGPD: només nom i primer cognom; mai telèfon ni email)
// ---------------------------------------------------------------------------

/** Nom públic: nom + primer cognom ("Gemma Pou"), decisió del coordinador per evitar ambigüitats. */
export const publicName = (first: string, last: string) => [first.trim(), nameWords(last)[0]].filter(Boolean).join(" ");

export async function entryNames(c: Client, entryIds: readonly string[]): Promise<Map<string, string>> {
  const { rows } = await c.query<{ entry_id: string; first_name: string; last_name: string }>(
    `SELECT ep.entry_id, p.first_name, p.last_name
       FROM entry_player ep JOIN player p ON p.id = ep.player_id
      WHERE ep.entry_id = ANY($1) ORDER BY p.last_name, p.first_name`,
    [entryIds],
  );
  const names = new Map<string, string[]>();
  for (const r of rows) names.set(r.entry_id, [...(names.get(r.entry_id) ?? []), publicName(r.first_name, r.last_name)]);
  return new Map([...names].map(([k, v]) => [k, v.join(" / ")]));
}

// ---------------------------------------------------------------------------
// Context d'un partit
// ---------------------------------------------------------------------------

export interface MatchRow {
  id: string;
  group_id: string;
  division_id: string;
  competition_id: string;
  club_id: string;
  timezone: string;
  schedule: string;
  rules: CompetitionRules;
  purpose: "REGULAR" | "TIEBREAK" | "PLAYOFF";
  playoff_code: string | null;
  week_start: string;
  entry_a_id: string;
  entry_b_id: string;
  status: "UNSCHEDULED" | "PROPOSED" | "SCHEDULED" | "RESULT_PENDING" | "PLAYED" | "WALKOVER";
  walkover_reason: string | null;
}

export async function loadMatch(c: Client, matchId: string, lock = false): Promise<MatchRow> {
  const { rows } = await c.query<MatchRow>(
    `SELECT m.id, m.group_id, g.division_id, d.competition_id, s.club_id, cl.timezone, cat.schedule, comp.rules,
            m.purpose, m.playoff_code, m.week_start, m.entry_a_id, m.entry_b_id, m.status, m.walkover_reason
       FROM match m
       JOIN "group" g ON g.id = m.group_id
       JOIN division d ON d.id = g.division_id
       JOIN category cat ON cat.id = d.category_id
       JOIN competition comp ON comp.id = d.competition_id
       JOIN season s ON s.id = comp.season_id
       JOIN club cl ON cl.id = s.club_id
      WHERE m.id = $1 ${lock ? "FOR UPDATE OF m" : ""}`,
    [matchId],
  );
  if (!rows[0]) throw notFound("Match");
  return rows[0];
}

function sideOf(match: MatchRow, entryId: string): "A" | "B" {
  if (match.entry_a_id === entryId) return "A";
  if (match.entry_b_id === entryId) return "B";
  throw forbidden("This pair does not play this match");
}

const rivalOf = (match: MatchRow, entryId: string) =>
  sideOf(match, entryId) === "A" ? match.entry_b_id : match.entry_a_id;

async function calendarFor(c: Client, match: Pick<MatchRow, "club_id" | "rules">): Promise<LeagueCalendar> {
  const { rows } = await c.query<{ date: string }>("SELECT date FROM blackout_date WHERE club_id = $1", [match.club_id]);
  return { schedules: match.rules.schedules, blackoutDates: rows.map((r) => r.date) };
}

/** Jugadors que juguen el partit per cada parella: alineació registrada o, si no n'hi ha, titulars. */
export async function lineups(c: Client, matchIds: readonly string[]): Promise<Map<string, Map<string, string[]>>> {
  const { rows } = await c.query<{ match_id: string; entry_id: string; player_id: string }>(
    `SELECT m.id AS match_id, e.entry_id, COALESCE(ml.player_id, ep.player_id) AS player_id
       FROM match m
       CROSS JOIN LATERAL (VALUES (m.entry_a_id), (m.entry_b_id)) AS e(entry_id)
       LEFT JOIN entry_player ep
              ON ep.entry_id = e.entry_id
             AND NOT EXISTS (SELECT 1 FROM match_lineup x WHERE x.match_id = m.id AND x.entry_id = e.entry_id)
       LEFT JOIN match_lineup ml ON ml.match_id = m.id AND ml.entry_id = e.entry_id
      WHERE m.id = ANY($1)
        AND COALESCE(ml.player_id, ep.player_id) IS NOT NULL
      ORDER BY 1, 2, 3`,
    [matchIds],
  );
  const out = new Map<string, Map<string, string[]>>();
  for (const r of rows) {
    const byEntry = out.get(r.match_id) ?? new Map<string, string[]>();
    byEntry.set(r.entry_id, [...(byEntry.get(r.entry_id) ?? []), r.player_id]);
    out.set(r.match_id, byEntry);
  }
  return out;
}

/** Reserves actives (proposades o confirmades) del club en una data, amb els jugadors de cada partit. */
async function activeBookingsOn(c: Client, clubId: string, dates: readonly string[]): Promise<ExistingBooking[]> {
  const { rows } = await c.query<{ match_id: string; play_date: string; start_time: string; court: number }>(
    `SELECT b.match_id, b.play_date, to_char(b.start_time, 'HH24:MI') AS start_time, co.number AS court
       FROM booking b JOIN court co ON co.id = b.court_id
      WHERE co.club_id = $1 AND b.play_date = ANY($2) AND b.status IN ('PROPOSED', 'CONFIRMED')`,
    [clubId, dates],
  );
  const players = await lineups(c, rows.map((r) => r.match_id));
  return rows.map((r) => ({
    matchId: r.match_id,
    slot: { date: r.play_date, start: r.start_time, court: r.court },
    players: [...(players.get(r.match_id)?.values() ?? [])].flat(),
  }));
}

async function lockClub(c: Client, clubId: string) {
  await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [clubId]);
}

// ---------------------------------------------------------------------------
// Agenda: franges, proposta, confirmació, rebuig, aprovació
// ---------------------------------------------------------------------------

export interface SlotView {
  date: string;
  start: string;
  court: number;
  requiresApproval: boolean;
}

/** Franges lliures de la setmana del partit on cap dels 4 jugadors ja juga aquell dia. */
export async function availableSlots(c: Client, entryId: string, matchId: string, now: Date): Promise<SlotView[]> {
  const match = await loadMatch(c, matchId);
  sideOf(match, entryId);
  const calendar = await calendarFor(c, match);
  const slots = slotsForWeek(calendar, match.schedule, match.week_start);
  const existing = await activeBookingsOn(c, match.club_id, [...new Set(slots.map((s) => s.date))]);
  const players = [...((await lineups(c, [matchId])).get(matchId)?.values() ?? [])].flat();
  return slots
    .filter((s) => localToInstant(s.date, s.start, match.timezone) > now)
    .filter((s) =>
      validateBooking(calendar, { matchId, schedule: match.schedule, roundWeek: match.week_start, players, slot: s }, existing).ok,
    )
    .map((s) => ({ date: s.date, start: s.start, court: s.court, requiresApproval: s.extra }));
}

export async function proposeBooking(
  c: Client,
  entryId: string,
  matchId: string,
  slot: { date: string; start: string; court: number },
  now: Date,
) {
  const pre = await loadMatch(c, matchId);
  await lockClub(c, pre.club_id);
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  if (match.status !== "UNSCHEDULED")
    throw conflict("MATCH_NOT_UNSCHEDULED", `Match is ${match.status}; reject or cancel the current booking first`);

  const startsAt = localToInstant(slot.date, slot.start, match.timezone);
  if (startsAt <= now) throw badRequest("SLOT_IN_THE_PAST", "The slot has already started");

  const calendar = await calendarFor(c, match);
  const players = [...((await lineups(c, [matchId])).get(matchId)?.values() ?? [])].flat();
  const existing = await activeBookingsOn(c, match.club_id, [slot.date]);
  const validation = validateBooking(
    calendar,
    { matchId, schedule: match.schedule, roundWeek: match.week_start, players, slot },
    existing,
  );
  if (!validation.ok) throw conflict("BOOKING_CONFLICT", "The slot is not available", validation.conflicts);

  const court = await c.query<{ id: string }>("SELECT id FROM court WHERE club_id = $1 AND number = $2", [
    match.club_id,
    slot.court,
  ]);
  if (!court.rows[0]) throw badRequest("UNKNOWN_COURT", `Court ${slot.court} does not exist`);

  const { rows } = await c.query<{ id: string }>(
    `INSERT INTO booking (match_id, court_id, play_date, start_time, starts_at, status, proposed_by_entry_id, proposed_at, requires_approval)
     VALUES ($1, $2, $3, $4, $5, 'PROPOSED', $6, $7, $8) RETURNING id`,
    [matchId, court.rows[0].id, slot.date, slot.start, startsAt, entryId, now, validation.requiresCoordinatorApproval],
  );
  await c.query("UPDATE match SET status = 'PROPOSED' WHERE id = $1", [matchId]);
  await audit(c, { kind: "entry", entryId }, "booking", rows[0]!.id, "PROPOSE", { matchId, slot });
  return { bookingId: rows[0]!.id, requiresApproval: validation.requiresCoordinatorApproval };
}

interface BookingRow {
  id: string;
  status: string;
  proposed_by_entry_id: string;
  requires_approval: boolean;
  approved_at: Date | null;
  confirmed_at: Date | null;
  starts_at: Date;
}

async function activeBooking(c: Client, matchId: string): Promise<BookingRow | undefined> {
  const { rows } = await c.query<BookingRow>(
    `SELECT id, status, proposed_by_entry_id, requires_approval, approved_at, confirmed_at, starts_at
       FROM booking WHERE match_id = $1 AND status IN ('PROPOSED', 'CONFIRMED') FOR UPDATE`,
    [matchId],
  );
  return rows[0];
}

const scheduledStatus = (b: Pick<BookingRow, "requires_approval" | "approved_at">) =>
  b.requires_approval && !b.approved_at ? "PROPOSED" : "SCHEDULED";

export async function confirmBooking(c: Client, entryId: string, matchId: string, now: Date) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  const booking = await activeBooking(c, matchId);
  if (!booking || booking.status !== "PROPOSED") throw conflict("NO_PROPOSAL", "There is no proposal to confirm");
  if (booking.proposed_by_entry_id === entryId) throw forbidden("The rival pair must confirm the proposal");
  await c.query("UPDATE booking SET status = 'CONFIRMED', confirmed_at = $2 WHERE id = $1", [booking.id, now]);
  const status = scheduledStatus(booking);
  await c.query("UPDATE match SET status = $2 WHERE id = $1", [matchId, status]);
  await audit(c, { kind: "entry", entryId }, "booking", booking.id, "CONFIRM");
  return { status };
}

/**
 * Retirar la pròpia proposta no té cap efecte. Rebutjar la proposta de la rival compta com una
 * cancel·lació d'aquell enfrontament: avís, i WO per a la rival a la 3a.
 */
export async function rejectBooking(c: Client, entryId: string, matchId: string, now: Date) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  const booking = await activeBooking(c, matchId);
  if (!booking || booking.status !== "PROPOSED") throw conflict("NO_PROPOSAL", "There is no proposal to reject");
  if (booking.proposed_by_entry_id === entryId) {
    await c.query("UPDATE booking SET status = 'REJECTED' WHERE id = $1", [booking.id]);
    await c.query("UPDATE match SET status = 'UNSCHEDULED' WHERE id = $1", [matchId]);
    await audit(c, { kind: "entry", entryId }, "booking", booking.id, "WITHDRAW");
    return { kind: "WITHDRAWN" as const };
  }
  return recordCancellation(c, match, booking, entryId, now, "REJECT");
}

export async function approveBooking(c: Client, bookingId: string, now: Date) {
  const { rows } = await c.query<BookingRow & { match_id: string }>(
    "SELECT *, match_id FROM booking WHERE id = $1 FOR UPDATE",
    [bookingId],
  );
  const b = rows[0];
  if (!b) throw notFound("Booking");
  if (!b.requires_approval || !["PROPOSED", "CONFIRMED"].includes(b.status))
    throw conflict("NOTHING_TO_APPROVE", "This booking does not need approval");
  await c.query("UPDATE booking SET approved_at = $2 WHERE id = $1", [bookingId, now]);
  if (b.status === "CONFIRMED") await c.query("UPDATE match SET status = 'SCHEDULED' WHERE id = $1", [b.match_id]);
  await audit(c, { kind: "admin" }, "booking", bookingId, "APPROVE");
}

// ---------------------------------------------------------------------------
// Cancel·lacions, no presentació i WO
// ---------------------------------------------------------------------------

async function insertMatchCharges(c: Client, match: MatchRow, reason: MatchChargeReason) {
  const byEntry = (await lineups(c, [match.id])).get(match.id) ?? new Map<string, string[]>();
  const players = [...byEntry.values()].flat();
  const { rows } = await c.query<{ id: string; is_member: boolean }>(
    `SELECT p.id, COALESCE(ep.is_member, p.is_member) AS is_member
       FROM player p
       LEFT JOIN entry_player ep ON ep.player_id = p.id AND ep.entry_id IN ($2, $3)
      WHERE p.id = ANY($1)`,
    [players, match.entry_a_id, match.entry_b_id],
  );
  const member = new Map(rows.map((r) => [r.id, r.is_member]));
  const charges = matchCharges(match.rules.fees, Object.fromEntries(byEntry), (p) => member.get(p) ?? false, reason);
  for (const ch of charges)
    await c.query(
      `INSERT INTO charge (competition_id, player_id, concept, match_id, amount_cents)
       VALUES ($1, $2, 'MATCH', $3, $4)
       ON CONFLICT (match_id, player_id) WHERE concept = 'MATCH' AND voided_at IS NULL DO NOTHING`,
      [match.competition_id, ch.playerId, match.id, ch.amountCents],
    );
}

async function nextRevision(c: Client, matchId: string): Promise<number> {
  const { rows } = await c.query<{ n: number }>(
    "SELECT COALESCE(max(revision), 0) + 1 AS n FROM match_result WHERE match_id = $1",
    [matchId],
  );
  return rows[0]!.n;
}

async function applyWalkover(
  c: Client,
  actor: Actor,
  match: MatchRow,
  winnerEntryId: string,
  reason: "NO_SHOW" | "REPEATED_CANCELLATIONS" | "LATE_CANCELLATION",
  chargeReason: MatchChargeReason,
  now: Date,
) {
  const sets = walkoverSets(match.entry_a_id === winnerEntryId ? "A" : "B");
  await c.query(
    `INSERT INTO match_result (match_id, revision, outcome, sets, reported_by_entry_id, confirmed_at)
     VALUES ($1, $2, 'WALKOVER', $3, $4, $5)`,
    [match.id, await nextRevision(c, match.id), JSON.stringify(sets), actor.kind === "entry" ? actor.entryId : null, now],
  );
  await c.query("UPDATE match SET status = 'WALKOVER', walkover_reason = $2 WHERE id = $1", [match.id, reason]);
  await insertMatchCharges(c, match, chargeReason);
  // Notificació al coordinador: tots els WO queden a l'auditoria perquè els revisi i, si cal, els reverteixi.
  await audit(c, actor, "match", match.id, "WALKOVER", { reason, winner: winnerEntryId });
}

export async function cancelBooking(c: Client, entryId: string, matchId: string, now: Date) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  const booking = await activeBooking(c, matchId);
  if (!booking || booking.status !== "CONFIRMED")
    throw conflict("NOTHING_TO_CANCEL", "Only a confirmed booking can be cancelled (reject a proposal instead)");
  if (booking.starts_at <= now) throw conflict("MATCH_STARTED", "The match has already started");
  return recordCancellation(c, match, booking, entryId, now, "CANCEL");
}

/** Registra una cancel·lació (o rebuig) i n'aplica l'efecte segons la política: avís o WO per a la rival. */
async function recordCancellation(
  c: Client,
  match: MatchRow,
  booking: BookingRow,
  entryId: string,
  now: Date,
  kind: "CANCEL" | "REJECT",
) {
  const { rows: previous } = await c.query<{ cancelled_by_entry_id: string; cancelled_at: Date; match_starts_at: Date }>(
    "SELECT cancelled_by_entry_id, cancelled_at, match_starts_at FROM cancellation WHERE match_id = $1 ORDER BY cancelled_at",
    [match.id],
  );
  const toDomain = (r: { cancelled_by_entry_id: string; cancelled_at: Date; match_starts_at: Date }) => ({
    matchId: match.id,
    cancelledBy: r.cancelled_by_entry_id,
    cancelledAt: r.cancelled_at.toISOString(),
    matchStartsAt: r.match_starts_at.toISOString(),
  });
  const current = { cancelled_by_entry_id: entryId, cancelled_at: now, match_starts_at: booking.starts_at };
  const outcome = evaluateCancellation(
    match.rules.cancellation,
    { id: match.id, entryA: match.entry_a_id, entryB: match.entry_b_id },
    previous.map(toDomain),
    toDomain(current),
  );

  await c.query("UPDATE booking SET status = $4, cancelled_by_entry_id = $2, cancelled_at = $3 WHERE id = $1", [
    booking.id,
    entryId,
    now,
    kind === "CANCEL" ? "CANCELLED" : "REJECTED",
  ]);
  await c.query(
    `INSERT INTO cancellation (match_id, booking_id, cancelled_by_entry_id, cancelled_at, match_starts_at, outcome, kind)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [match.id, booking.id, entryId, now, booking.starts_at, JSON.stringify(outcome), kind],
  );
  await audit(c, { kind: "entry", entryId }, "booking", booking.id, kind, outcome);

  if (outcome.kind === "WARNING") await c.query("UPDATE match SET status = 'UNSCHEDULED' WHERE id = $1", [match.id]);
  else
    await applyWalkover(
      c,
      { kind: "system" },
      match,
      outcome.winner,
      outcome.reason,
      { kind: "CANCELLATION_WALKOVER", chargedEntry: outcome.chargedEntry },
      now,
    );
  return outcome;
}

/** La parella present comunica que la rival no s'ha presentat → WO automàtic (revisable pel coordinador). */
export async function reportNoShow(c: Client, entryId: string, matchId: string, now: Date) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  if (match.status !== "SCHEDULED") throw conflict("MATCH_NOT_SCHEDULED", "Only a confirmed match can be a no-show");
  const booking = await activeBooking(c, matchId);
  if (!booking || booking.starts_at > now) throw conflict("MATCH_NOT_STARTED", "The match has not started yet");
  const absent = rivalOf(match, entryId);
  await applyWalkover(c, { kind: "entry", entryId }, match, entryId, "NO_SHOW", { kind: "NO_SHOW", absentEntry: absent }, now);
}

export async function revertWalkover(c: Client, matchId: string, now: Date) {
  const match = await loadMatch(c, matchId, true);
  if (match.status !== "WALKOVER") throw conflict("NOT_A_WALKOVER", "Match is not a walkover");
  await c.query("UPDATE charge SET voided_at = $2 WHERE match_id = $1 AND voided_at IS NULL", [matchId, now]);
  const booking = await c.query<{ id: string }>(
    "SELECT id FROM booking WHERE match_id = $1 AND status = 'CONFIRMED'",
    [matchId],
  );
  const status = booking.rows[0] ? "SCHEDULED" : "UNSCHEDULED";
  await c.query("UPDATE match SET status = $2, walkover_reason = NULL WHERE id = $1", [matchId, status]);
  await audit(c, { kind: "admin" }, "match", matchId, "REVERT_WALKOVER");
  return { status };
}

// ---------------------------------------------------------------------------
// Resultats
// ---------------------------------------------------------------------------

export interface ResultInput {
  sets: SetScore[];
  timeLimit?: TimeLimitFinish | undefined;
}

function assertValidResult(input: ResultInput) {
  const v = validateMatchSets(input.sets, input.timeLimit);
  if (!v.ok) throw badRequest("INVALID_RESULT", v.error);
}

/** Una parella comunica el resultat; la rival l'ha de confirmar. */
export async function reportResult(c: Client, entryId: string, matchId: string, input: ResultInput, now: Date) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  if (match.status !== "SCHEDULED") throw conflict("MATCH_NOT_SCHEDULED", `Match is ${match.status}`);
  const booking = await activeBooking(c, matchId);
  if (!booking || booking.starts_at > now) throw conflict("MATCH_NOT_STARTED", "The match has not started yet");
  assertValidResult(input);
  await c.query(
    `INSERT INTO match_result (match_id, revision, outcome, sets, time_limit, reported_by_entry_id)
     VALUES ($1, $2, 'PLAYED', $3, $4, $5)`,
    [matchId, await nextRevision(c, matchId), JSON.stringify(input.sets), input.timeLimit ? JSON.stringify(input.timeLimit) : null, entryId],
  );
  await c.query("UPDATE match SET status = 'RESULT_PENDING' WHERE id = $1", [matchId]);
  await audit(c, { kind: "entry", entryId }, "match", matchId, "REPORT_RESULT", input);
}

async function pendingResult(c: Client, matchId: string) {
  const { rows } = await c.query<{ revision: number; reported_by_entry_id: string }>(
    "SELECT revision, reported_by_entry_id FROM match_result WHERE match_id = $1 ORDER BY revision DESC LIMIT 1",
    [matchId],
  );
  return rows[0];
}

export async function confirmResult(c: Client, entryId: string, matchId: string, now: Date) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  if (match.status !== "RESULT_PENDING") throw conflict("NO_PENDING_RESULT", "There is no result to confirm");
  const result = await pendingResult(c, matchId);
  if (result!.reported_by_entry_id === entryId) throw forbidden("The rival pair must confirm the result");
  await c.query("UPDATE match_result SET confirmed_at = $3 WHERE match_id = $1 AND revision = $2", [matchId, result!.revision, now]);
  await c.query("UPDATE match SET status = 'PLAYED' WHERE id = $1", [matchId]);
  await insertMatchCharges(c, match, { kind: "PLAYED" });
  await audit(c, { kind: "entry", entryId }, "match", matchId, "CONFIRM_RESULT");
}

/** La rival no hi està d'acord: el resultat queda descartat i el partit torna a estar pendent de resultat. */
export async function disputeResult(c: Client, entryId: string, matchId: string) {
  const match = await loadMatch(c, matchId, true);
  sideOf(match, entryId);
  if (match.status !== "RESULT_PENDING") throw conflict("NO_PENDING_RESULT", "There is no result to dispute");
  const result = await pendingResult(c, matchId);
  if (result!.reported_by_entry_id === entryId) throw forbidden("The rival pair must dispute the result");
  await c.query("UPDATE match SET status = 'SCHEDULED' WHERE id = $1", [matchId]);
  await audit(c, { kind: "entry", entryId }, "match", matchId, "DISPUTE_RESULT", { revision: result!.revision });
}

/** El coordinador registra o corregeix un resultat (nova revisió, confirmada directament). */
export async function adminSetResult(
  c: Client,
  matchId: string,
  input: ResultInput & { lineups?: Record<string, [string, string]> | undefined },
  now: Date,
) {
  const match = await loadMatch(c, matchId, true);
  assertValidResult(input);
  if (input.lineups) {
    await c.query("DELETE FROM match_lineup WHERE match_id = $1", [matchId]);
    for (const [entryId, players] of Object.entries(input.lineups)) {
      sideOf(match, entryId);
      for (const p of players)
        await c.query("INSERT INTO match_lineup (match_id, entry_id, player_id) VALUES ($1, $2, $3)", [matchId, entryId, p]);
    }
  }
  await c.query(
    `INSERT INTO match_result (match_id, revision, outcome, sets, time_limit, reported_by_admin, confirmed_at)
     VALUES ($1, $2, 'PLAYED', $3, $4, true, $5)`,
    [matchId, await nextRevision(c, matchId), JSON.stringify(input.sets), input.timeLimit ? JSON.stringify(input.timeLimit) : null, now],
  );
  await c.query("UPDATE match SET status = 'PLAYED', walkover_reason = NULL WHERE id = $1", [matchId]);
  await c.query("UPDATE charge SET voided_at = $2 WHERE match_id = $1 AND voided_at IS NULL", [matchId, now]);
  await insertMatchCharges(c, match, { kind: "PLAYED" });
  await audit(c, { kind: "admin" }, "match", matchId, "SET_RESULT", input);
}

// ---------------------------------------------------------------------------
// Classificacions i rànquing
// ---------------------------------------------------------------------------

async function completedMatches(c: Client, where: string, param: string): Promise<CompletedMatch[]> {
  const { rows } = await c.query<{
    id: string;
    purpose: CompletedMatch["purpose"];
    entry_a_id: string;
    entry_b_id: string;
    status: "PLAYED" | "WALKOVER";
    sets: SetScore[];
    time_limit: TimeLimitFinish | null;
  }>(
    `SELECT m.id, m.purpose, m.entry_a_id, m.entry_b_id, m.status, r.sets, r.time_limit
       FROM match m
       JOIN "group" g ON g.id = m.group_id
       JOIN LATERAL (
         SELECT sets, time_limit FROM match_result
          WHERE match_id = m.id AND confirmed_at IS NOT NULL
          ORDER BY revision DESC LIMIT 1
       ) r ON true
      WHERE m.status IN ('PLAYED', 'WALKOVER') AND ${where} = $1`,
    [param],
  );
  const lu = await lineups(c, rows.map((r) => r.id));
  return rows.map((r) => {
    const m: CompletedMatch = {
      id: r.id,
      purpose: r.purpose,
      entryA: r.entry_a_id,
      entryB: r.entry_b_id,
      outcome: r.status,
      sets: r.sets,
    };
    if (r.time_limit) m.timeLimit = r.time_limit;
    const a = lu.get(r.id)?.get(r.entry_a_id);
    const b = lu.get(r.id)?.get(r.entry_b_id);
    if (a?.length === 2) m.lineupA = [a[0]!, a[1]!];
    if (b?.length === 2) m.lineupB = [b[0]!, b[1]!];
    return m;
  });
}

async function groupEntries(c: Client, groupId: string): Promise<string[]> {
  const { rows } = await c.query<{ entry_id: string }>(
    "SELECT entry_id FROM group_member WHERE group_id = $1 ORDER BY position",
    [groupId],
  );
  return rows.map((r) => r.entry_id);
}

export async function groupStandings(c: Client, groupId: string, coordinatorOrder?: string[]) {
  const entries = await groupEntries(c, groupId);
  if (entries.length === 0) throw notFound("Group");
  const matches = await completedMatches(c, "m.group_id", groupId);
  const rows = computeStandings(coordinatorOrder ? { entries, matches, coordinatorOrder } : { entries, matches });
  const names = await entryNames(c, entries);
  return rows.map((r) => ({ ...r, name: names.get(r.entryId) ?? "" }));
}

export async function divisionPlayerRanking(c: Client, divisionId: string) {
  const { rows } = await c.query<{ entry_id: string; player_id: string }>(
    `SELECT ep.entry_id, ep.player_id FROM entry_player ep JOIN entry e ON e.id = ep.entry_id
      WHERE e.division_id = $1 ORDER BY ep.entry_id, ep.player_id`,
    [divisionId],
  );
  const entryPlayers = new Map<string, readonly [string, string]>();
  const grouped = new Map<string, string[]>();
  for (const r of rows) grouped.set(r.entry_id, [...(grouped.get(r.entry_id) ?? []), r.player_id]);
  for (const [e, ps] of grouped) if (ps.length === 2) entryPlayers.set(e, [ps[0]!, ps[1]!]);

  const matches = await completedMatches(c, "g.division_id", divisionId);
  const ranking = computePlayerRanking({ entryPlayers, matches });
  const { rows: players } = await c.query<{ id: string; first_name: string; last_name: string }>(
    "SELECT id, first_name, last_name FROM player WHERE id = ANY($1)",
    [ranking.map((r) => r.playerId)],
  );
  const names = new Map(players.map((p) => [p.id, publicName(p.first_name, p.last_name)]));
  return ranking.map((r) => ({ ...r, name: names.get(r.playerId) ?? "" }));
}

// ---------------------------------------------------------------------------
// Inscripcions, grups i Round Robin
// ---------------------------------------------------------------------------

export interface PlayerInput {
  firstName: string;
  lastName: string;
  phone?: string | undefined;
  email?: string | undefined;
  isMember: boolean;
  declaredLevel?: string | undefined;
  shirtSize?: string | undefined;
}

const normalizePhone = (p?: string) => {
  const digits = p?.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 9 ? `34${digits}` : digits;
};
const normalizeEmail = (e?: string) => e?.trim().toLowerCase() || null;

async function upsertPlayer(c: Client, clubId: string, p: PlayerInput): Promise<string> {
  const phone = normalizePhone(p.phone);
  const email = normalizeEmail(p.email);
  if (phone || email) {
    const { rows } = await c.query<{ id: string }>(
      `SELECT id FROM player WHERE club_id = $1 AND (phone_normalized = $2 OR email_normalized = $3) LIMIT 1`,
      [clubId, phone, email],
    );
    if (rows[0]) {
      await c.query("UPDATE player SET is_member = $2 WHERE id = $1", [rows[0].id, p.isMember]);
      return rows[0].id;
    }
  }
  const { rows } = await c.query<{ id: string }>(
    `INSERT INTO player (club_id, first_name, last_name, phone, email, phone_normalized, email_normalized, is_member)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [clubId, p.firstName.trim(), p.lastName.trim(), p.phone ?? null, p.email ?? null, phone, email, p.isMember],
  );
  return rows[0]!.id;
}

async function loadDivision(c: Client, divisionId: string) {
  const { rows } = await c.query<{
    id: string;
    competition_id: string;
    category_id: string;
    club_id: string;
    first_week: string;
    rules: CompetitionRules;
  }>(
    `SELECT d.id, d.competition_id, d.category_id, s.club_id, comp.first_week, comp.rules
       FROM division d JOIN competition comp ON comp.id = d.competition_id JOIN season s ON s.id = comp.season_id
      WHERE d.id = $1`,
    [divisionId],
  );
  if (!rows[0]) throw notFound("Division");
  return rows[0];
}

export async function importEntries(
  c: Client,
  divisionId: string,
  pairs: { seed?: number | undefined; players: [PlayerInput, PlayerInput] }[],
) {
  const division = await loadDivision(c, divisionId);
  const created: string[] = [];
  for (const pair of pairs) {
    const { rows } = await c.query<{ id: string }>("INSERT INTO entry (division_id, seed) VALUES ($1, $2) RETURNING id", [
      divisionId,
      pair.seed ?? null,
    ]);
    const entryId = rows[0]!.id;
    for (const p of pair.players) {
      const playerId = await upsertPlayer(c, division.club_id, p);
      const fee = p.isMember ? division.rules.fees.registrationMember : division.rules.fees.registrationNonMember;
      try {
        await c.query("SAVEPOINT ep");
        await c.query(
          `INSERT INTO entry_player
             (entry_id, player_id, competition_id, category_id, is_member, registration_fee_cents, declared_level, shirt_size)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [entryId, playerId, division.competition_id, division.category_id, p.isMember, fee, p.declaredLevel ?? null, p.shirtSize ?? null],
        );
        await c.query("RELEASE SAVEPOINT ep");
      } catch (err) {
        await c.query("ROLLBACK TO SAVEPOINT ep");
        if ((err as { code?: string }).code === "23505")
          throw conflict("PLAYER_ALREADY_IN_CATEGORY", `${p.firstName} ${p.lastName} is already registered in this category`);
        throw err;
      }
      // Un sol pagament d'inscripció per persona i prova, encara que jugui dues categories.
      await c.query(
        `INSERT INTO charge (competition_id, player_id, concept, amount_cents) VALUES ($1, $2, 'REGISTRATION', $3)
         ON CONFLICT (competition_id, player_id) WHERE concept = 'REGISTRATION' AND voided_at IS NULL DO NOTHING`,
        [division.competition_id, playerId, fee],
      );
    }
    created.push(entryId);
  }
  await audit(c, { kind: "admin" }, "division", divisionId, "IMPORT_ENTRIES", { count: created.length });
  return created;
}

/** Reparteix les parelles en grups (serpentí per cap de sèrie) i genera el Round Robin amb una jornada per setmana. */
/**
 * Obre una divisió: grups de `groupSize` parelles (decisió del coordinador: només s'obren divisions
 * amb un mínim de 6 parelles; la resta queden inscrites i pendents). `firstWeek` permet obrir-la més
 * tard que la resta de la prova (per defecte, la setmana de la J1 de la prova).
 */
export async function generateGroups(c: Client, divisionId: string, opts: { firstWeek?: string | undefined } = {}) {
  const division = await loadDivision(c, divisionId);
  const firstWeek = opts.firstWeek ?? division.first_week;
  if (isoWeekday(firstWeek) !== 1) throw badRequest("NOT_A_MONDAY", "firstWeek must be a Monday");
  if (firstWeek < division.first_week) throw badRequest("BEFORE_COMPETITION", "firstWeek is before the competition starts");
  const existing = await c.query('SELECT 1 FROM "group" WHERE division_id = $1', [divisionId]);
  if (existing.rowCount) throw conflict("GROUPS_EXIST", "Groups already generated for this division");
  const { rows: entries } = await c.query<{ id: string }>(
    "SELECT id FROM entry WHERE division_id = $1 AND status = 'ACTIVE' ORDER BY seed NULLS LAST, created_at, id",
    [divisionId],
  );
  if (entries.length < division.rules.groupSize)
    throw conflict(
      "NOT_ENOUGH_ENTRIES",
      `This division has ${entries.length} pairs; at least ${division.rules.groupSize} are needed to open it`,
      { entries: entries.length, required: division.rules.groupSize },
    );

  const groupCount = Math.ceil(entries.length / division.rules.groupSize);
  const buckets: string[][] = Array.from({ length: groupCount }, () => []);
  entries.forEach((e, i) => {
    const row = Math.floor(i / groupCount);
    const col = i % groupCount;
    buckets[row % 2 === 0 ? col : groupCount - 1 - col]!.push(e.id);
  });

  const groups = [];
  for (const [gi, members] of buckets.entries()) {
    const code = String.fromCharCode(65 + gi);
    const { rows } = await c.query<{ id: string }>('INSERT INTO "group" (division_id, code) VALUES ($1, $2) RETURNING id', [
      divisionId,
      code,
    ]);
    const groupId = rows[0]!.id;
    for (const [pos, entryId] of members.entries())
      await c.query("INSERT INTO group_member (group_id, entry_id, position) VALUES ($1, $2, $3)", [groupId, entryId, pos + 1]);

    let matchCount = 0;
    for (const round of generateRoundRobin(members)) {
      const week = addDays(firstWeek, (round.number - 1) * 7);
      const r = await c.query<{ id: string }>(
        "INSERT INTO round (group_id, number, week_start) VALUES ($1, $2, $3) RETURNING id",
        [groupId, round.number, week],
      );
      for (const m of round.matches) {
        await c.query(
          `INSERT INTO match (group_id, round_id, purpose, week_start, entry_a_id, entry_b_id)
           VALUES ($1, $2, 'REGULAR', $3, $4, $5)`,
          [groupId, r.rows[0]!.id, week, m.entryA, m.entryB],
        );
        matchCount++;
      }
    }
    groups.push({ id: groupId, code, entries: members.length, matches: matchCount });
  }
  await audit(c, { kind: "admin" }, "division", divisionId, "GENERATE_GROUPS", groups);
  return groups;
}

/** Crea els partits de playoff que ja es poden determinar (semis i consolació; la final quan hi hagi semis). */
export async function createPlayoffs(c: Client, groupId: string) {
  const pending = await c.query(
    "SELECT 1 FROM match WHERE group_id = $1 AND purpose = 'REGULAR' AND status NOT IN ('PLAYED', 'WALKOVER')",
    [groupId],
  );
  if (pending.rowCount) throw conflict("ROUND_ROBIN_NOT_FINISHED", `${pending.rowCount} regular matches are still open`);

  const standings = await groupStandings(c, groupId);
  const { rows: playoffRows } = await c.query<{ playoff_code: string; id: string }>(
    "SELECT playoff_code, id FROM match WHERE group_id = $1 AND purpose = 'PLAYOFF'",
    [groupId],
  );
  const played = await completedMatches(c, "m.group_id", groupId);
  const byCode = Object.fromEntries(
    playoffRows.flatMap((r) => {
      const m = played.find((x) => x.id === r.id);
      return m ? [[r.playoff_code, m]] : [];
    }),
  );
  const existingCodes = new Set(playoffRows.map((r) => r.playoff_code));
  const { rows: last } = await c.query<{ week: string }>(
    "SELECT max(week_start)::text AS week FROM round WHERE group_id = $1",
    [groupId],
  );

  const created = [];
  let pairings;
  try {
    pairings = resolvePlayoffs(standings, byCode);
  } catch (err) {
    throw conflict("UNRESOLVED_TIE", (err as Error).message);
  }
  for (const p of pairings) {
    if (existingCodes.has(p.code) || !p.entryA || !p.entryB) continue;
    const week = addDays(last[0]!.week, p.round * 7);
    const { rows } = await c.query<{ id: string }>(
      `INSERT INTO match (group_id, purpose, playoff_code, week_start, entry_a_id, entry_b_id)
       VALUES ($1, 'PLAYOFF', $2, $3, $4, $5) RETURNING id`,
      [groupId, p.code, week, p.entryA, p.entryB],
    );
    created.push({ id: rows[0]!.id, code: p.code, week, entryA: p.entryA, entryB: p.entryB });
  }
  await audit(c, { kind: "admin" }, "group", groupId, "CREATE_PLAYOFFS", created);
  return created;
}

// ---------------------------------------------------------------------------
// Enllaç privat de parella
// ---------------------------------------------------------------------------

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createAccessLink(c: Client, entryId: string): Promise<string> {
  const exists = await c.query("SELECT 1 FROM entry WHERE id = $1", [entryId]);
  if (!exists.rowCount) throw notFound("Entry");
  const token = randomBytes(24).toString("base64url");
  await c.query("UPDATE entry_access SET revoked_at = now() WHERE entry_id = $1 AND revoked_at IS NULL", [entryId]);
  await c.query("INSERT INTO entry_access (entry_id, token_hash) VALUES ($1, $2)", [entryId, hashToken(token)]);
  await audit(c, { kind: "admin" }, "entry", entryId, "CREATE_ACCESS_LINK");
  return token;
}

export async function entryForToken(c: Client, token: string): Promise<string | undefined> {
  const { rows } = await c.query<{ entry_id: string }>(
    "SELECT entry_id FROM entry_access WHERE token_hash = $1 AND revoked_at IS NULL",
    [hashToken(token)],
  );
  return rows[0]?.entry_id;
}

// ---------------------------------------------------------------------------
// Vistes
// ---------------------------------------------------------------------------

export async function matchesView(c: Client, where: string, params: unknown[]) {
  const { rows } = await c.query<{
    id: string;
    purpose: string;
    playoff_code: string | null;
    round_number: number | null;
    week_start: string;
    entry_a_id: string;
    entry_b_id: string;
    status: string;
    walkover_reason: string | null;
    division_id: string;
    group_code: string;
    play_date: string | null;
    start_time: string | null;
    court: number | null;
    booking_status: string | null;
    proposed_by_entry_id: string | null;
    requires_approval: boolean | null;
    approved_at: Date | null;
    sets: SetScore[] | null;
    time_limit: TimeLimitFinish | null;
    result_confirmed: boolean | null;
    result_reported_by: string | null;
  }>(
    `SELECT m.id, m.purpose, m.playoff_code, r.number AS round_number, m.week_start, m.entry_a_id, m.entry_b_id,
            m.status, m.walkover_reason, g.division_id, g.code AS group_code,
            b.play_date, to_char(b.start_time, 'HH24:MI') AS start_time, co.number AS court,
            b.status AS booking_status, b.proposed_by_entry_id, b.requires_approval, b.approved_at,
            res.sets, res.time_limit, res.confirmed_at IS NOT NULL AS result_confirmed,
            res.reported_by_entry_id AS result_reported_by
       FROM match m
       JOIN "group" g ON g.id = m.group_id
       LEFT JOIN round r ON r.id = m.round_id
       LEFT JOIN booking b ON b.match_id = m.id AND b.status IN ('PROPOSED', 'CONFIRMED')
       LEFT JOIN court co ON co.id = b.court_id
       LEFT JOIN LATERAL (
         SELECT sets, time_limit, confirmed_at, reported_by_entry_id FROM match_result
          WHERE match_id = m.id ORDER BY revision DESC LIMIT 1
       ) res ON m.status IN ('RESULT_PENDING', 'PLAYED', 'WALKOVER')
      WHERE ${where}
      ORDER BY m.week_start, r.number NULLS LAST, m.playoff_code, b.play_date, b.start_time, co.number`,
    params,
  );
  const names = await entryNames(c, [...new Set(rows.flatMap((r) => [r.entry_a_id, r.entry_b_id]))]);
  return rows.map((r) => ({
    id: r.id,
    purpose: r.purpose,
    playoffCode: r.playoff_code,
    round: r.round_number,
    week: r.week_start,
    divisionId: r.division_id,
    group: r.group_code,
    status: r.status,
    walkoverReason: r.walkover_reason,
    entryA: { id: r.entry_a_id, name: names.get(r.entry_a_id) ?? "" },
    entryB: { id: r.entry_b_id, name: names.get(r.entry_b_id) ?? "" },
    booking: r.play_date
      ? {
          date: r.play_date,
          start: r.start_time,
          court: r.court,
          status: r.booking_status,
          proposedBy: r.proposed_by_entry_id,
          awaitingApproval: Boolean(r.requires_approval && !r.approved_at),
        }
      : null,
    result: r.sets
      ? { sets: r.sets, timeLimit: r.time_limit, confirmed: r.result_confirmed, reportedBy: r.result_reported_by }
      : null,
  }));
}

/** Estat de l'agenda d'una setmana per al coordinador. */
export async function weekStatus(c: Client, competitionId: string, week: string) {
  const { rows } = await c.query<{ division: string; status: string; n: number }>(
    `SELECT cat.name || ' ' || lv.name AS division, m.status, count(*)::int AS n
       FROM match m
       JOIN "group" g ON g.id = m.group_id
       JOIN division d ON d.id = g.division_id
       JOIN category cat ON cat.id = d.category_id
       JOIN level lv ON lv.id = d.level_id
      WHERE d.competition_id = $1 AND m.week_start = $2
      GROUP BY 1, 2 ORDER BY 1, 2`,
    [competitionId, week],
  );
  const summary: Record<string, Record<string, number>> = {};
  for (const r of rows) (summary[r.division] ??= {})[r.status] = r.n;
  const all = await matchesView(
    c,
    "m.week_start = $1::date AND g.division_id IN (SELECT id FROM division WHERE competition_id = $2)",
    [week, competitionId],
  );
  return {
    week,
    summary,
    unscheduled: all.filter((m) => m.status === "UNSCHEDULED"),
    awaitingApproval: all.filter((m) => m.booking?.awaitingApproval),
    walkovers: all.filter((m) => m.status === "WALKOVER"),
  };
}
