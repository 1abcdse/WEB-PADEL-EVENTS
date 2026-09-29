import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { AppContext } from "../app.js";
import { divisionPlayerRanking, groupStandings, matchesView } from "../league.js";
import { idParams } from "./schemas.js";

export const publicRoutes =
  (ctx: AppContext): FastifyPluginAsync =>
  async (app) => {
    const q = <T extends object>(sql: string, params: unknown[]) => ctx.pool.query<T & object>(sql, params);

    app.get("/competitions", async () => {
      const { rows } = await q(
        `SELECT comp.id, comp.slug, comp.name, comp.status, comp.first_week, s.name AS season
           FROM competition comp JOIN season s ON s.id = comp.season_id ORDER BY comp.first_week DESC`,
        [],
      );
      return rows;
    });

    app.get("/competitions/:competitionId", async (req) => {
      const { competitionId } = idParams("competitionId").parse(req.params) as { competitionId: string };
      const { rows } = await q<{ division_id: string }>(
        `SELECT d.id AS division_id, cat.code AS category_code, cat.name AS category, lv.code AS level_code,
                lv.name AS level, cat.schedule,
                COALESCE(json_agg(json_build_object('id', g.id, 'code', g.code) ORDER BY g.code)
                         FILTER (WHERE g.id IS NOT NULL), '[]') AS groups
           FROM division d
           JOIN category cat ON cat.id = d.category_id
           JOIN level lv ON lv.id = d.level_id
           LEFT JOIN "group" g ON g.division_id = d.id
          WHERE d.competition_id = $1 AND EXISTS (SELECT 1 FROM entry e WHERE e.division_id = d.id)
          GROUP BY d.id, cat.code, cat.name, cat.sort_order, lv.code, lv.name, lv.sort_order, cat.schedule
          ORDER BY cat.sort_order, lv.sort_order`,
        [competitionId],
      );
      return { divisions: rows };
    });

    app.get("/groups/:groupId/standings", async (req) => {
      const { groupId } = idParams("groupId").parse(req.params) as { groupId: string };
      const c = await ctx.pool.connect();
      try {
        return await groupStandings(c, groupId);
      } finally {
        c.release();
      }
    });

    app.get("/groups/:groupId/matches", async (req) => {
      const { groupId } = idParams("groupId").parse(req.params) as { groupId: string };
      const c = await ctx.pool.connect();
      try {
        return await matchesView(c, "m.group_id = $1", [groupId]);
      } finally {
        c.release();
      }
    });

    app.get("/divisions/:divisionId/ranking", async (req) => {
      const { divisionId } = idParams("divisionId").parse(req.params) as { divisionId: string };
      const c = await ctx.pool.connect();
      try {
        return await divisionPlayerRanking(c, divisionId);
      } finally {
        c.release();
      }
    });

    /** Agenda pública de la setmana: només reserves confirmades. */
    app.get("/competitions/:competitionId/agenda", async (req) => {
      const { competitionId } = idParams("competitionId").parse(req.params) as { competitionId: string };
      const { week } = z.object({ week: z.iso.date() }).parse(req.query);
      const c = await ctx.pool.connect();
      try {
        const all = await matchesView(
          c,
          "m.week_start = $1::date AND g.division_id IN (SELECT id FROM division WHERE competition_id = $2)",
          [week, competitionId],
        );
        return all
          .filter((m) => m.booking?.status === "CONFIRMED")
          .map(({ booking, ...m }) => ({ ...m, booking: { date: booking!.date, start: booking!.start, court: booking!.court } }));
      } finally {
        c.release();
      }
    });
  };
