# Lliga Social de Pàdel — Club Tennis & Pàdel El Masnou

Aplicació web per gestionar la Lliga Social de Pàdel (temporada 2026/27).

- Arquitectura i decisions de domini: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Motors de domini purs (sense BD ni UI): [`packages/domain`](packages/domain)
- API REST + PostgreSQL: [`apps/api`](apps/api)
- Web (Next.js): [`apps/web`](apps/web) — pantalla de parella a `/p/<token>`
- Competicions (HTML autònom): [`competicions/index.html`](competicions/index.html) — estructura amb tres pestanyes independents: Lliga Social, Tornejos (Express, per equips Express, cap de setmana) i Playoffs (quadre gràfic de Final a Ronda de 32)
- Americana (HTML autònom, s'obre directament al navegador): [`americana/index.html`](americana/index.html) — rondes, playoffs i **Lliga 100 punts** acumulada entre americanes (es guarda al navegador; exportable en JSON)

## Desenvolupament

```bash
pnpm install
docker compose up -d                 # PostgreSQL 16 (bases padel i padel_test)
cp apps/api/.env.example apps/api/.env   # i omple ADMIN_TOKEN
pnpm --filter @padel/api seed        # migracions + club, temporada, Prova 1 i divisions
pnpm --filter @padel/api dev         # API a http://localhost:4000
pnpm --filter @padel/web dev         # web a http://localhost:3000 (fa de proxy de /api cap a l'API)

# Dades de prova (esborra la BD local): 6 parelles a Masculina C amb els seus enllaços
pnpm --filter @padel/api demo

pnpm test                            # tests de domini i d'integració de l'API
pnpm typecheck
```
