import { createPool } from "./db.js";
import { migrate } from "./migrate.js";
import { seed } from "./seed.js";

const pool = createPool();
await migrate(pool);
console.log(JSON.stringify(await seed(pool), null, 2));
await pool.end();
