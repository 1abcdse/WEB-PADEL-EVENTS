/**
 * Importa el full d'inscrits (format "## PARELLA N") a una divisió.
 *
 *   pnpm --filter @padel/api import-registrations <fitxer.md> <CATEGORIA-NIVELL>          # només revisa
 *   pnpm --filter @padel/api import-registrations <fitxer.md> <CATEGORIA-NIVELL> --apply  # importa
 *
 * El resum no mostra telèfons ni emails.
 */
import { readFileSync } from "node:fs";
import { createPool, tx } from "./db.js";
import { parseRegistrations } from "./import/registrations.js";
import { importEntries } from "./league.js";
import { migrate } from "./migrate.js";

const [file, divisionKey] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const apply = process.argv.includes("--apply");
if (!file || !divisionKey) {
  console.error("Ús: import-registrations <fitxer> <CATEGORIA-NIVELL> [--apply]   (p. ex. FEMENINA-C)");
  process.exit(1);
}

const { pairs, warnings } = parseRegistrations(readFileSync(file, "utf8"));
const sizes: Record<string, number> = {};
let members = 0;
for (const pair of pairs) {
  console.log(
    `Parella ${pair.number}: ${pair.players
      .map((p) => `${p.firstName} ${p.lastName} (${p.declaredLevel ?? "?"}, ${p.shirtSize ?? "?"}, ${p.isMember ? "abonat/da" : "NO abonat/da"})`)
      .join(" + ")}`,
  );
  for (const p of pair.players) {
    if (p.shirtSize) sizes[p.shirtSize] = (sizes[p.shirtSize] ?? 0) + 1;
    if (p.isMember) members++;
  }
}
const total = pairs.length * 2;
console.log(`\n${pairs.length} parelles, ${total} jugadors/es: ${members} abonats/des, ${total - members} no abonats/des`);
console.log(`Talles: ${Object.entries(sizes).map(([k, v]) => `${k} ${v}`).join(", ")}`);
if (warnings.length) console.log(`Avisos:\n - ${warnings.join("\n - ")}`);

if (!apply) {
  console.log("\n(Revisió: no s'ha importat res. Afegeix --apply per importar.)");
  process.exit(0);
}

const [category, level] = divisionKey.toUpperCase().split("-");
const pool = createPool();
await migrate(pool);
const ids = await tx(pool, async (c) => {
  const { rows } = await c.query<{ id: string }>(
    `SELECT d.id FROM division d
       JOIN category cat ON cat.id = d.category_id JOIN level lv ON lv.id = d.level_id
       JOIN competition comp ON comp.id = d.competition_id
      WHERE cat.code = $1 AND lv.code = $2 AND comp.slug = 'prova-1'`,
    [category, level],
  );
  if (!rows[0]) throw new Error(`Divisió ${divisionKey} no trobada`);
  return importEntries(
    c,
    rows[0].id,
    pairs.map((p) => ({ seed: p.number, players: p.players })),
  );
});
console.log(`\nImportades ${ids.length} parelles a ${divisionKey}.`);
await pool.end();
