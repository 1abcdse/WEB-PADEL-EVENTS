import { timingSafeEqual } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { Pool } from "./db.js";
import { ApiError } from "./errors.js";
import { adminRoutes } from "./routes/admin.js";
import { entryRoutes } from "./routes/entry.js";
import { publicRoutes } from "./routes/public.js";

export interface AppOptions {
  pool: Pool;
  adminToken: string;
  /** URL base de la web, per construir els enllaços de parella per WhatsApp. */
  publicUrl: string;
  /** Rellotge injectable (tests). */
  now?: () => Date;
  logger?: boolean;
}

export interface AppContext {
  pool: Pool;
  publicUrl: string;
  now: () => Date;
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function buildApp(opts: AppOptions): FastifyInstance {
  if (opts.adminToken.length < 16) throw new Error("ADMIN_TOKEN must be at least 16 characters");
  const app = Fastify({ logger: opts.logger ?? false });
  const ctx: AppContext = { pool: opts.pool, publicUrl: opts.publicUrl, now: opts.now ?? (() => new Date()) };

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ApiError)
      return reply.status(err.status).send({ code: err.code, message: err.message, details: err.details });
    if (err instanceof ZodError)
      return reply.status(400).send({ code: "VALIDATION_ERROR", message: "Invalid request", details: err.issues });
    const pgCode = (err as { code?: string }).code;
    if (pgCode === "22P02") return reply.status(400).send({ code: "INVALID_ID", message: "Invalid identifier" });
    if (pgCode === "23505") return reply.status(409).send({ code: "ALREADY_EXISTS", message: "Conflicting data" });
    req.log.error(err);
    return reply.status(500).send({ code: "INTERNAL", message: "Internal error" });
  });

  app.get("/health", async () => ({ ok: true }));
  app.register(publicRoutes(ctx), { prefix: "/api/public" });
  app.register(entryRoutes(ctx), { prefix: "/api/entry" });
  app.register(adminRoutes(ctx, opts.adminToken), { prefix: "/api/admin" });
  return app;
}
