import { buildApp } from "./app.js";
import { createPool } from "./db.js";
import { migrate } from "./migrate.js";

const pool = createPool();
await migrate(pool);
const app = buildApp({
  pool,
  adminToken: process.env.ADMIN_TOKEN ?? "",
  publicUrl: process.env.PUBLIC_URL ?? "http://localhost:3000",
  // Només per a proves locals: fixa el rellotge de l'API (p. ex. DEMO_NOW=2026-10-13T22:45:00+02:00).
  ...(process.env.DEMO_NOW && process.env.NODE_ENV !== "production"
    ? { now: () => new Date(process.env.DEMO_NOW!) }
    : {}),
  logger: true,
});
await app.listen({ host: process.env.HOST ?? "0.0.0.0", port: Number(process.env.PORT ?? 4000) });
