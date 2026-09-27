import { describe, expect, it } from "vitest";
import {
  CALENDAR_2026_27,
  isoWeekday,
  slotsForWeek,
  validateBooking,
  weekStart,
  weeklyCapacity,
} from "../src/index.js";

const J1 = "2026-10-12"; // dilluns de la primera jornada

describe("calendari 2026/27", () => {
  it("dates base", () => {
    expect(isoWeekday("2026-10-12")).toBe(1);
    expect(weekStart("2026-10-18")).toBe("2026-10-12");
  });

  it("Masculina/Femenina: dt, dc, dv 21:00 × 4 pistes, dijous d'emergència", () => {
    const slots = slotsForWeek(CALENDAR_2026_27, "WEEKDAY", J1);
    expect([...new Set(slots.map((s) => s.date))]).toEqual(["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]);
    expect(slots.filter((s) => s.extra).every((s) => s.date === "2026-10-15")).toBe(true);
    expect(weeklyCapacity(CALENDAR_2026_27, "WEEKDAY", J1)).toEqual({ regular: 12, extra: 3 }); // 12 partits de M/F per jornada: hi caben
  });

  it("Mixta: ds i dg de 9:00 a 19:30 amb 4 pistes, 5a pista extra al migdia i a la tarda", () => {
    const slots = slotsForWeek(CALENDAR_2026_27, "WEEKEND", J1);
    expect([...new Set(slots.map((s) => s.date))]).toEqual(["2026-10-17", "2026-10-18"]);
    const saturday = slots.filter((s) => s.date === "2026-10-17");
    expect([...new Set(saturday.map((s) => s.start))]).toEqual([
      "09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30",
    ]);
    expect(saturday.filter((s) => s.start === "09:00").map((s) => s.court)).toEqual([1, 2, 3, 4]);
    expect(saturday.filter((s) => s.start === "12:00").map((s) => [s.court, s.extra])).toEqual([
      [1, false], [2, false], [3, false], [4, false], [5, true],
    ]);
    expect(weeklyCapacity(CALENDAR_2026_27, "WEEKEND", J1)).toEqual({ regular: 64, extra: 12 });
  });

  it("els dies de tancament (31/12) no tenen franges; els festius (8/12) sí", () => {
    const dates = (monday: string) => slotsForWeek(CALENDAR_2026_27, "WEEKDAY", monday).map((s) => s.date);
    expect(dates("2026-12-28")).not.toContain("2026-12-31");
    expect(dates("2026-12-07")).toContain("2026-12-08");
  });
});

describe("validateBooking", () => {
  const base = {
    matchId: "m1",
    schedule: "WEEKDAY",
    roundWeek: J1,
    players: ["marc", "joan", "pere", "pau"],
    slot: { date: "2026-10-13", start: "21:00", court: 1 },
  };

  it("accepta una franja lliure de la setmana", () => {
    expect(validateBooking(CALENDAR_2026_27, base, [])).toEqual({
      ok: true,
      conflicts: [],
      requiresCoordinatorApproval: false,
    });
  });

  it("rebutja franges fora de la setmana de la jornada o de l'horari de la categoria", () => {
    const nextWeek = validateBooking(CALENDAR_2026_27, { ...base, slot: { ...base.slot, date: "2026-10-20" } }, []);
    expect(nextWeek.conflicts).toContainEqual({ type: "OUTSIDE_ROUND_WEEK" });
    const monday = validateBooking(CALENDAR_2026_27, { ...base, slot: { ...base.slot, date: "2026-10-12" } }, []);
    expect(monday.conflicts).toContainEqual({ type: "NOT_A_LEAGUE_SLOT" });
    const saturday = validateBooking(CALENDAR_2026_27, { ...base, slot: { date: "2026-10-17", start: "09:00", court: 1 } }, []);
    expect(saturday.conflicts).toContainEqual({ type: "NOT_A_LEAGUE_SLOT" });
  });

  it("pista ocupada i jugador que ja juga aquell dia", () => {
    const existing = [{ matchId: "m2", slot: base.slot, players: ["anna", "laia", "marc", "eva"] }];
    const v = validateBooking(CALENDAR_2026_27, base, existing);
    expect(v.ok).toBe(false);
    expect(v.conflicts).toContainEqual({ type: "COURT_TAKEN", matchId: "m2" });
    expect(v.conflicts).toContainEqual({ type: "PLAYER_BUSY_SAME_DAY", playerId: "marc", matchId: "m2" });
  });

  it("el dijous és vàlid però necessita aprovació del coordinador", () => {
    const v = validateBooking(CALENDAR_2026_27, { ...base, slot: { date: "2026-10-15", start: "21:00", court: 2 } }, []);
    expect(v).toMatchObject({ ok: true, requiresCoordinatorApproval: true });
  });
});
