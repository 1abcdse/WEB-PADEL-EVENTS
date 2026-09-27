import { buildApp } from "./app.js";
import { createPool } from "./db.js";
import { migrate } from "./migrate.js";

const pool = createPool();
await migrate(pool);
const app = buildApp({
  pool,
  adminToken: process.env.ADMIN_TOKEN ?? "",
  publicUrl: process.env.PUBLIC_URL ?? "http://localhost:3000",
  logger: true,
});
await app.listen({ host: process.env.HOST ?? "0.0.0.0", port: Number(process.env.PORT ?? 4000) });
