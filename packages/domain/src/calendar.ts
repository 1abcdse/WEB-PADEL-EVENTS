import type { PlayerId } from "./types.js";

/** Data local del club (Europe/Madrid) en format YYYY-MM-DD. */
export type LocalDate = string;
/** Hora local HH:MM. */
export type LocalTime = string;

/** Dia ISO: 1 = dilluns … 7 = diumenge. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SlotRule {
  weekdays: readonly IsoWeekday[];
  startTimes: readonly LocalTime[];
  courts: number;
  /** Franja d'emergència: només amb aprovació del coordinador. */
  emergency?: boolean;
}

export interface LeagueCalendar {
  /** Franges per horari (p. ex. WEEKDAY per a Masculina/Femenina, WEEKEND per a Mixta). */
  schedules: Readonly<Record<string, readonly SlotRule[]>>;
  /** Dies de tancament del club (31/12, 6/1…). Els festius normals es juguen. */
  blackoutDates: readonly LocalDate[];
}

export interface Slot {
  date: LocalDate;
  start: LocalTime;
  court: number;
  emergency: boolean;
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isoWeekday(date: LocalDate): IsoWeekday {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (day === 0 ? 7 : day) as IsoWeekday;
}

/** Dilluns de la setmana d'una data. */
export function weekStart(date: LocalDate): LocalDate {
  return addDays(date, 1 - isoWeekday(date));
}

/** Totes les franges (dia × hora × pista) d'una setmana per a un horari, sense els dies de tancament. */
export function slotsForWeek(calendar: LeagueCalendar, schedule: string, monday: LocalDate): Slot[] {
  const rules = calendar.schedules[schedule];
  if (!rules) throw new Error(`Unknown schedule ${schedule}`);
  const blackout = new Set(calendar.blackoutDates);
  const slots: Slot[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart(monday), i);
    if (blackout.has(date)) continue;
    for (const rule of rules) {
      if (!rule.weekdays.includes(isoWeekday(date))) continue;
      for (const start of rule.startTimes)
        for (let court = 1; court <= rule.courts; court++)
          slots.push({ date, start, court, emergency: rule.emergency ?? false });
    }
  }
  return slots.sort((x, y) => (x.date + x.start).localeCompare(y.date + y.start) || x.court - y.court);
}

export interface WeeklyCapacity {
  regular: number;
  emergency: number;
}

export function weeklyCapacity(calendar: LeagueCalendar, schedule: string, monday: LocalDate): WeeklyCapacity {
  const slots = slotsForWeek(calendar, schedule, monday);
  const emergency = slots.filter((s) => s.emergency).length;
  return { regular: slots.length - emergency, emergency };
}

export interface ExistingBooking {
  matchId: string;
  slot: Omit<Slot, "emergency">;
  players: readonly PlayerId[];
}

export interface BookingRequest {
  matchId: string;
  /** Horari de la divisió del partit (WEEKDAY, WEEKEND…). */
  schedule: string;
  /** Dilluns de la setmana de la jornada: el partit s'ha de jugar dins d'aquesta setmana. */
  roundWeek: LocalDate;
  /** Els 4 jugadors que jugaran (titulars o suplents). */
  players: readonly PlayerId[];
  slot: Omit<Slot, "emergency">;
}

export type BookingConflict =
  | { type: "OUTSIDE_ROUND_WEEK" }
  | { type: "NOT_A_LEAGUE_SLOT" }
  | { type: "COURT_TAKEN"; matchId: string }
  | { type: "PLAYER_BUSY_SAME_DAY"; playerId: PlayerId; matchId: string };

export interface BookingValidation {
  ok: boolean;
  conflicts: BookingConflict[];
  /** La franja és d'emergència (dijous): la reserva necessita aprovació del coordinador. */
  requiresCoordinatorApproval: boolean;
}

/** Hard constraints d'una proposta de reserva (§18). */
export function validateBooking(
  calendar: LeagueCalendar,
  request: BookingRequest,
  existing: readonly ExistingBooking[],
): BookingValidation {
  const conflicts: BookingConflict[] = [];
  const { slot } = request;

  if (weekStart(slot.date) !== weekStart(request.roundWeek)) conflicts.push({ type: "OUTSIDE_ROUND_WEEK" });

  const leagueSlot = slotsForWeek(calendar, request.schedule, slot.date).find(
    (s) => s.date === slot.date && s.start === slot.start && s.court === slot.court,
  );
  if (!leagueSlot) conflicts.push({ type: "NOT_A_LEAGUE_SLOT" });

  for (const b of existing) {
    if (b.matchId === request.matchId) continue;
    if (b.slot.date === slot.date && b.slot.start === slot.start && b.slot.court === slot.court)
      conflicts.push({ type: "COURT_TAKEN", matchId: b.matchId });
    if (b.slot.date === slot.date)
      for (const p of request.players)
        if (b.players.includes(p)) conflicts.push({ type: "PLAYER_BUSY_SAME_DAY", playerId: p, matchId: b.matchId });
  }

  return {
    ok: conflicts.length === 0,
    conflicts,
    requiresCoordinatorApproval: leagueSlot?.emergency ?? false,
  };
}
