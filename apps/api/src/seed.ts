import { CALENDAR_2026_27, CANCELLATION_POLICY_2026_27, FEES_2026_27 } from "@padel/domain";
import { tx, type Pool } from "./db.js";
import type { CompetitionRules } from "./league.js";

export const RULES_2026_27: CompetitionRules = {
  schedules: CALENDAR_2026_27.schedules,
  cancellation: CANCELLATION_POLICY_2026_27,
  fees: FEES_2026_27,
  groupSize: 6,
};

/** Dades base: club, temporada 2026/27, Prova 1 i les 6 divisions (3 categories × nivells C i B). Idempotent. */
export async function seed(pool: Pool) {
  return tx(pool, async (c) => {
    const one = async (sql: string, params: unknown[]) => (await c.query<{ id: string }>(sql, params)).rows[0]!.id;

    const clubId = await one(
      `INSERT INTO club (slug, name) VALUES ('el-masnou', 'Club Tennis & Pàdel El Masnou')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [],
    );
    for (let n = 1; n <= 5; n++)
      await c.query("INSERT INTO court (club_id, number, name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [
        clubId,
        n,
        `Pista ${n}`,
      ]);
    for (const [date, reason] of [
      ["2026-12-31", "Tancament del club"],
      ["2027-01-06", "Tancament del club"],
    ])
      await c.query("INSERT INTO blackout_date (club_id, date, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [
        clubId,
        date,
        reason,
      ]);

    const categories: Record<string, string> = {};
    for (const [i, [code, name, schedule]] of [
      ["MASCULINA", "Masculina", "WEEKDAY"],
      ["FEMENINA", "Femenina", "WEEKDAY"],
      ["MIXTA", "Mixta", "WEEKEND"],
    ].entries())
      categories[code!] = await one(
        `INSERT INTO category (club_id, code, name, schedule, sort_order) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (club_id, code) DO UPDATE SET name = EXCLUDED.name, schedule = EXCLUDED.schedule RETURNING id`,
        [clubId, code, name, schedule, i],
      );
    const levels: Record<string, string> = {};
    for (const [i, code] of ["C", "B"].entries())
      levels[code] = await one(
        `INSERT INTO level (club_id, code, name, sort_order) VALUES ($1, $2, $3, $4)
         ON CONFLICT (club_id, code) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [clubId, code, `Nivell ${code}`, i],
      );

    const seasonId = await one(
      `INSERT INTO season (club_id, name) VALUES ($1, '2026/27')
       ON CONFLICT (club_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [clubId],
    );
    const competitionId = await one(
      `INSERT INTO competition (season_id, slug, name, status, registration_deadline, first_week, end_date, rules)
       VALUES ($1, 'prova-1', 'Prova 1 (Oct–Des 2026)', 'REGISTRATION_OPEN', '2026-10-09', '2026-10-12', '2027-01-31', $2)
       ON CONFLICT (season_id, slug) DO UPDATE SET rules = EXCLUDED.rules RETURNING id`,
      [seasonId, JSON.stringify(RULES_2026_27)],
    );
    const divisions: Record<string, string> = {};
    for (const cat of Object.keys(categories))
      for (const lv of Object.keys(levels))
        divisions[`${cat}-${lv}`] = await one(
          `INSERT INTO division (competition_id, category_id, level_id) VALUES ($1, $2, $3)
           ON CONFLICT (competition_id, category_id, level_id) DO UPDATE SET level_id = EXCLUDED.level_id RETURNING id`,
          [competitionId, categories[cat], levels[lv]],
        );
    return { clubId, seasonId, competitionId, divisions };
  });
}
