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

  it("Masculina/Femenina: dt, dc, dv 21:00 × 3 pistes, dijous d'emergència", () => {
    const slots = slotsForWeek(CALENDAR_2026_27, "WEEKDAY", J1);
    expect([...new Set(slots.map((s) => s.date))]).toEqual(["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16"]);
    expect(slots.filter((s) => s.emergency).every((s) => s.date === "2026-10-15")).toBe(true);
    expect(weeklyCapacity(CALENDAR_2026_27, "WEEKDAY", J1)).toEqual({ regular: 9, emergency: 3 });
  });

  it("Mixta: dissabte i diumenge des de les 9:00", () => {
    const slots = slotsForWeek(CALENDAR_2026_27, "WEEKEND", J1);
    expect([...new Set(slots.map((s) => s.date))]).toEqual(["2026-10-17", "2026-10-18"]);
    expect(slots[0]).toMatchObject({ start: "09:00", court: 1 });
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
