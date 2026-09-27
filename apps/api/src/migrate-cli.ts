import { createPool } from "./db.js";
import { migrate } from "./migrate.js";

const pool = createPool();
const done = await migrate(pool);
console.log(done.length ? `Applied: ${done.join(", ")}` : "Database up to date");
await pool.end();
