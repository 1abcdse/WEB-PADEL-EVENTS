import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { z } from "zod";
import { safeEqual, type AppContext } from "../app.js";
import { tx } from "../db.js";
import { ApiError } from "../errors.js";
import * as league from "../league.js";
import { idParams, resultBody, uuid } from "./schemas.js";

const playerBody = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().optional(),
  email: z.email().optional(),
  isMember: z.boolean(),
  declaredLevel: z.string().trim().max(8).optional(),
  shirtSize: z.string().trim().max(8).optional(),
});

const importBody = z.object({
  pairs: z
    .array(z.object({ seed: z.number().int().positive().optional(), players: z.tuple([playerBody, playerBody]) }))
    .min(1),
});

/**
 * API del coordinador. De moment s'autentica amb `Authorization: Bearer <ADMIN_TOKEN>`;
 * el login amb sessió i contrasenya (Argon2) arriba amb el panell d'administració.
 */
export const adminRoutes =
  (ctx: AppContext, adminToken: string): FastifyPluginAsync =>
  async (app) => {
    app.addHook("preHandler", async (req) => {
      const header = req.headers.authorization ?? "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      if (!token || !safeEqual(token, adminToken)) throw new ApiError(401, "UNAUTHORIZED", "Admin token required");
    });

    const param = (req: FastifyRequest, name: string) => (idParams(name).parse(req.params) as Record<string, string>)[name]!;
    const run = <T>(fn: Parameters<typeof tx<T>>[1]) => tx(ctx.pool, fn);

    app.post("/divisions/:divisionId/entries", async (req, reply) => {
      const { pairs } = importBody.parse(req.body);
      const ids = await run((c) =>
        league.importEntries(
          c,
          param(req, "divisionId"),
          pairs.map((p) => ({ seed: p.seed, players: p.players })),
        ),
      );
      return reply.status(201).send({ entryIds: ids });
    });

    app.post("/divisions/:divisionId/groups", async (req, reply) => {
      const { firstWeek } = z.object({ firstWeek: z.iso.date().optional() }).parse(req.body ?? {});
      const groups = await run((c) => league.generateGroups(c, param(req, "divisionId"), { firstWeek }));
      return reply.status(201).send({ groups });
    });

    app.post("/groups/:groupId/playoffs", async (req, reply) => {
      const matches = await run((c) => league.createPlayoffs(c, param(req, "groupId")));
      return reply.status(201).send({ matches });
    });

    /** Genera (o regenera, revocant l'anterior) l'enllaç privat d'una parella, llest per enviar per WhatsApp. */
    app.post("/entries/:entryId/access-link", async (req) => {
      const entryId = param(req, "entryId");
      return run(async (c) => {
        const token = await league.createAccessLink(c, entryId);
        const name = (await league.entryNames(c, [entryId])).get(entryId);
        const url = `${ctx.publicUrl}/p/${token}`;
        const whatsappText =
          `Hola ${name}! 🎾 Aquest és el vostre enllaç de la Lliga Social de Pàdel per agendar i confirmar ` +
          `els partits i posar-ne el resultat. No el compartiu: ${url}`;
        return { url, whatsappText, whatsappLink: `https://wa.me/?text=${encodeURIComponent(whatsappText)}` };
      });
    });

    app.get("/competitions/:competitionId/weeks/:week", async (req) => {
      const { competitionId, week } = z
        .object({ competitionId: uuid, week: z.iso.date() })
        .parse(req.params);
      return run((c) => league.weekStatus(c, competitionId, week));
    });

    app.post("/bookings/:bookingId/approve", async (req) => {
      await run((c) => league.approveBooking(c, param(req, "bookingId"), ctx.now()));
      return { ok: true };
    });

    app.post("/matches/:matchId/result", async (req) => {
      const body = resultBody
        .extend({ lineups: z.record(uuid, z.tuple([uuid, uuid])).optional() })
        .parse(req.body);
      await run((c) => league.adminSetResult(c, param(req, "matchId"), body, ctx.now()));
      return { ok: true };
    });

    app.post("/matches/:matchId/walkover/revert", async (req) =>
      run((c) => league.revertWalkover(c, param(req, "matchId"), ctx.now())),
    );

    app.get("/competitions/:competitionId/charges", async (req) => {
      const { rows } = await ctx.pool.query(
        `SELECT ch.id, ch.concept, ch.amount_cents, ch.match_id, ch.created_at, ch.paid_at,
                p.id AS player_id, p.first_name, p.last_name, p.phone
           FROM charge ch JOIN player p ON p.id = ch.player_id
          WHERE ch.competition_id = $1 AND ch.voided_at IS NULL
          ORDER BY p.last_name, p.first_name, ch.created_at`,
        [param(req, "competitionId")],
      );
      return rows;
    });

    app.post("/charges/:chargeId/paid", async (req) => {
      const { rowCount } = await ctx.pool.query(
        "UPDATE charge SET paid_at = $2 WHERE id = $1 AND voided_at IS NULL AND paid_at IS NULL",
        [param(req, "chargeId"), ctx.now()],
      );
      if (!rowCount) throw new ApiError(409, "NOT_PAYABLE", "Charge not found or already paid");
      return { ok: true };
    });

    app.get("/audit", async (req) => {
      const { limit } = z.object({ limit: z.coerce.number().int().min(1).max(500).default(100) }).parse(req.query);
      const { rows } = await ctx.pool.query("SELECT * FROM audit_log ORDER BY id DESC LIMIT $1", [limit]);
      return rows;
    });
  };
