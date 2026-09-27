import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import type { AppContext } from "../app.js";
import { tx } from "../db.js";
import { ApiError } from "../errors.js";
import * as league from "../league.js";
import { idParams, resultBody, slotBody } from "./schemas.js";

declare module "fastify" {
  interface FastifyRequest {
    entryId?: string;
  }
}

/** API de parella: autenticada amb el token de l'enllaç privat (capçalera `X-Entry-Token`). */
export const entryRoutes =
  (ctx: AppContext): FastifyPluginAsync =>
  async (app) => {
    app.addHook("preHandler", async (req) => {
      const token = req.headers["x-entry-token"];
      if (typeof token !== "string" || token.length < 20) throw new ApiError(401, "UNAUTHORIZED", "Missing pair link token");
      const c = await ctx.pool.connect();
      try {
        const entryId = await league.entryForToken(c, token);
        if (!entryId) throw new ApiError(401, "UNAUTHORIZED", "Invalid or revoked pair link");
        req.entryId = entryId;
      } finally {
        c.release();
      }
    });

    const matchId = (req: FastifyRequest) => (idParams("matchId").parse(req.params) as { matchId: string }).matchId;
    const run = <T>(fn: Parameters<typeof tx<T>>[1]) => tx(ctx.pool, fn);

    app.get("/me", async (req) => {
      const entryId = req.entryId!;
      return run(async (c) => {
        const { rows } = await c.query<{ division_id: string; category: string; level: string; group_id: string | null }>(
          `SELECT e.division_id, cat.name AS category, lv.name AS level, gm.group_id
             FROM entry e JOIN division d ON d.id = e.division_id
             JOIN category cat ON cat.id = d.category_id JOIN level lv ON lv.id = d.level_id
             LEFT JOIN group_member gm ON gm.entry_id = e.id
            WHERE e.id = $1`,
          [entryId],
        );
        const names = await league.entryNames(c, [entryId]);
        const matches = await league.matchesView(c, "(m.entry_a_id = $1 OR m.entry_b_id = $1)", [entryId]);
        return { entryId, name: names.get(entryId), ...rows[0], matches };
      });
    });

    app.get("/matches/:matchId/slots", async (req) =>
      run((c) => league.availableSlots(c, req.entryId!, matchId(req), ctx.now())),
    );

    app.post("/matches/:matchId/proposal", async (req, reply) => {
      const slot = slotBody.parse(req.body);
      const res = await run((c) => league.proposeBooking(c, req.entryId!, matchId(req), slot, ctx.now()));
      return reply.status(201).send(res);
    });

    app.post("/matches/:matchId/confirm", async (req) =>
      run((c) => league.confirmBooking(c, req.entryId!, matchId(req), ctx.now())),
    );

    app.post("/matches/:matchId/reject", async (req) => {
      await run((c) => league.rejectBooking(c, req.entryId!, matchId(req)));
      return { ok: true };
    });

    app.post("/matches/:matchId/cancel", async (req) =>
      run((c) => league.cancelBooking(c, req.entryId!, matchId(req), ctx.now())),
    );

    app.post("/matches/:matchId/no-show", async (req) => {
      await run((c) => league.reportNoShow(c, req.entryId!, matchId(req), ctx.now()));
      return { ok: true };
    });

    app.post("/matches/:matchId/result", async (req) => {
      const body = resultBody.parse(req.body);
      await run((c) => league.reportResult(c, req.entryId!, matchId(req), body, ctx.now()));
      return { ok: true };
    });

    app.post("/matches/:matchId/result/confirm", async (req) => {
      await run((c) => league.confirmResult(c, req.entryId!, matchId(req), ctx.now()));
      return { ok: true };
    });

    app.post("/matches/:matchId/result/dispute", async (req) => {
      await run((c) => league.disputeResult(c, req.entryId!, matchId(req)));
      return { ok: true };
    });
  };
