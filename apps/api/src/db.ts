import pg from "pg";

// DATE com a text YYYY-MM-DD (data local del club), sense conversions de zona horària.
pg.types.setTypeParser(1082, (v) => v);

export type Pool = pg.Pool;
export type Client = pg.PoolClient;

export function createPool(connectionString = process.env.DATABASE_URL): Pool {
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new pg.Pool({ connectionString });
}

export async function tx<T>(pool: Pool, fn: (client: Client) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
