import type { LeagueCalendar } from "./calendar.js";
import type { CancellationPolicy } from "./cancellation.js";
import type { Fees } from "./charges.js";

/** Configuració de la Lliga Social 2026/27 (Club Tennis & Pàdel El Masnou). */
export const CALENDAR_2026_27: LeagueCalendar = {
  schedules: {
    /** Masculina i Femenina: dt, dc, dv a les 21:00 (mínim 3 pistes); dijous només d'emergència. */
    WEEKDAY: [
      { weekdays: [2, 3, 5], startTimes: ["21:00"], courts: 3 },
      { weekdays: [4], startTimes: ["21:00"], courts: 3, emergency: true },
    ],
    /** Mixta: ds i dg a partir de les 9:00. Hores i pistes posteriors pendents de confirmar amb el club. */
    WEEKEND: [{ weekdays: [6, 7], startTimes: ["09:00", "10:30", "12:00"], courts: 3 }],
  },
  blackoutDates: ["2026-12-31", "2027-01-06"],
};

export const CATEGORY_SCHEDULE_2026_27: Readonly<Record<string, string>> = {
  MASCULINA: "WEEKDAY",
  FEMENINA: "WEEKDAY",
  MIXTA: "WEEKEND",
};

export const CANCELLATION_POLICY_2026_27: CancellationPolicy = {
  cancellationsForWalkover: 3,
  minNoticeHours: 24,
  lateCancellation: "WALKOVER",
};

export const FEES_2026_27: Fees & { registrationMember: number; registrationNonMember: number } = {
  registrationMember: 1000,
  registrationNonMember: 2000,
  matchMember: 100,
  matchNonMember: 500,
};
