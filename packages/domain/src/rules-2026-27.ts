import type { LeagueCalendar } from "./calendar.js";
import type { CancellationPolicy } from "./cancellation.js";
import type { Fees } from "./charges.js";

/** Torns de 90 minuts del cap de setmana: el primer a les 9:00 i l'últim a les 19:30. */
const WEEKEND_STARTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"] as const;
/** Migdia i tarda: torns on el club pot obrir una 5a pista. */
const WEEKEND_MIDDAY_AFTERNOON = WEEKEND_STARTS.filter((t) => t >= "12:00");

/** Configuració de la Lliga Social 2026/27 (Club Tennis & Pàdel El Masnou). */
export const CALENDAR_2026_27: LeagueCalendar = {
  schedules: {
    /** Masculina i Femenina: dt, dc, dv a les 21:00 amb 4 pistes; dijous només d'emergència. */
    WEEKDAY: [
      { weekdays: [2, 3, 5], startTimes: ["21:00"], courts: 4 },
      { weekdays: [4], startTimes: ["21:00"], courts: 3, extra: true },
    ],
    /** Mixta: ds i dg de 9:00 a 19:30 (últim torn) amb 4 pistes; 5a pista opcional al migdia i a la tarda. */
    WEEKEND: [
      { weekdays: [6, 7], startTimes: WEEKEND_STARTS, courts: 4 },
      { weekdays: [6, 7], startTimes: WEEKEND_MIDDAY_AFTERNOON, courts: 1, firstCourt: 5, extra: true },
    ],
  },
  blackoutDates: ["2026-12-31", "2027-01-06"],
};

export const CATEGORY_SCHEDULE_2026_27: Readonly<Record<string, string>> = {
  MASCULINA: "WEEKDAY",
  FEMENINA: "WEEKDAY",
  MIXTA: "WEEKEND",
};

/** Totes les cancel·lacions (també les de menys de 24 h) són avisos; la 3a del mateix partit és WO. */
export const CANCELLATION_POLICY_2026_27: CancellationPolicy = {
  cancellationsForWalkover: 3,
  minNoticeHours: 24,
  lateCancellation: "COUNTS_AS_CANCELLATION",
};

export const FEES_2026_27: Fees & { registrationMember: number; registrationNonMember: number } = {
  registrationMember: 1000,
  registrationNonMember: 2000,
  matchMember: 100,
  matchNonMember: 500,
};
