# Lliga Social de Pàdel — Club Tennis & Pàdel El Masnou

Aplicació web per gestionar la Lliga Social de Pàdel (temporada 2026/27).

- Arquitectura i decisions de domini: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Motors de domini purs (sense BD ni UI): [`packages/domain`](packages/domain)
- API REST + PostgreSQL: [`apps/api`](apps/api)

## Desenvolupament

```bash
pnpm install
docker compose up -d                 # PostgreSQL 16 (bases padel i padel_test)
cp apps/api/.env.example apps/api/.env   # i omple ADMIN_TOKEN
pnpm --filter @padel/api seed        # migracions + club, temporada, Prova 1 i divisions
pnpm --filter @padel/api dev         # API a http://localhost:4000

pnpm test                            # tests de domini i d'integració de l'API
pnpm typecheck
```
