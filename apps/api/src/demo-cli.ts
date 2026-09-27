/**
 * Dades de demostració (MAI en producció): 6 parelles a Masculina C, grup i Round Robin,
 * i un enllaç de parella per a cadascuna. Esborra i recrea la base de dades indicada.
 */
import { createPool, tx } from "./db.js";
import { createAccessLink, entryNames, generateGroups, importEntries } from "./league.js";
import { migrate } from "./migrate.js";
import { seed } from "./seed.js";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("demo only runs against a local database");

const NAMES = [
  ["Marc", "Lis", "Joan", "Puig"],
  ["Pere", "Vila", "Pau", "Soler"],
  ["Jordi", "Mas", "Albert", "Roca"],
  ["Xavi", "Ferrer", "David", "Pons"],
  ["Oriol", "Serra", "Sergi", "Font"],
  ["Toni", "Camps", "Quim", "Bosch"],
];

const pool = createPool(url);
await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
await migrate(pool);
const ids = await seed(pool);
const division = ids.divisions["MASCULINA-C"]!;
const links = await tx(pool, async (c) => {
  const entries = await importEntries(
    c,
    division,
    NAMES.map(([f1, l1, f2, l2], i) => ({
      seed: i + 1,
      players: [
        { firstName: f1!, lastName: l1!, phone: `6000000${i}1`, isMember: true },
        { firstName: f2!, lastName: l2!, phone: `6000000${i}2`, isMember: i % 2 === 0 },
      ],
    })),
  );
  await generateGroups(c, division);
  const names = await entryNames(c, entries);
  const out = [];
  for (const e of entries) out.push({ name: names.get(e), token: await createAccessLink(c, e) });
  return out;
});
console.log(JSON.stringify({ competitionId: ids.competitionId, division, links }, null, 2));
await pool.end();
