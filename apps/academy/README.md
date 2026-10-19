# Padel System Academy — web

Web de **Padel System Academy (PS)**: experiències de pàdel tot inclòs (allotjament + àpats + entrenament) al Maresme.
Viu dins del monorepo `web-padel-events` com a `apps/academy`.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · next-intl (ca · es · en).
A les fases següents s'hi afegiran React Hook Form + Zod i Resend (formulari i emails).

## Arrencar en local

```bash
# des de l'arrel del monorepo
pnpm install
pnpm --filter @padel/academy dev     # http://localhost:3100
```

- Català és l'idioma per defecte (`/`). Castellà a `/es` i anglès a `/en`.
- Sistema de disseny per revisar: **`/styleguide`**.

Després del primer `pnpm install`, fes commit del `pnpm-lock.yaml` actualitzat.

## Editar contingut (sense tocar components)

| Què | On |
|---|---|
| Packs: hores, nits, preus, textos, programa dia a dia, extres | `src/content/packs.ts` |
| Email, WhatsApp, ubicació | `src/content/site.ts` |
| Textos generals de la web (3 idiomes) | `messages/ca.json`, `messages/es.json`, `messages/en.json` |

### Preus
Cada pack té `priceFrom`. Deixa'l a `null` mentre no estigui decidit (es mostra **"XXX €"**) o posa-hi un número en euros:

```ts
priceFrom: 290,
```

### Regles que es comproven automàticament
En compilar, `validatePacks` (a `src/lib/packs.ts`) atura el build amb un missatge clar si:
- un pack de **cap de setmana supera 20h** o un **stage supera 30h**;
- les nits no coincideixen amb el format (1 nit / 3 nits);
- el programa dia a dia **no suma** les hores del pack;
- algun dia del programa no pertany al format.

## Logo

Els SVG són a `public/brand/` (el text està convertit a traçats, així que es veuen igual a tot arreu):

| Fitxer | Ús |
|---|---|
| `ps-logo-horizontal.svg` | Fons clars |
| `ps-logo-horizontal-negative.svg` | Fons foscos |
| `ps-mark.svg` / `ps-mark-negative.svg` | Només la placa PS |
| `ps-icon.svg` | Icona d'app / avatar (també és el favicon) |

Per regenerar-los: `pnpm --filter @padel/academy logo` (requereix Python amb `fontTools` i la font Inter instal·lada).
A la web es fa servir el component `<Logo />` (`src/components/brand/Logo.tsx`).

## Sistema de disseny

Els tokens són a `src/app/globals.css` (Tailwind 4 els exposa com a classes: `bg-ink`, `text-lime`, `font-display`, `text-hero`…).

| Token | Hex | Ús |
|---|---|---|
| `ink` | `#0B0B0B` | Fons fosc, text |
| `lime` | `#D6FF2E` | Accent únic (CTA, xifres, franges) — sempre sobre negre |
| `paper` | `#FFFFFF` | Fons clar |
| `stone` | `#ECECE7` | Fons secundari |
| `graphite` | `#1A1A1A` | Targetes sobre negre |
| `mute` | `#8A8A85` | Text secundari sobre negre |

Components base a `src/components/`: `Button`, `FormatBadge`, `SkewTag`, `LimeBar`, `VDivider`, `Ball`, `Icon`,
`DayStrip`, `Counter`, `FadeIn`, `PackCard`, `FormatCard`.

## Variables d'entorn

Copia `.env.example` a `.env.local`. Resend s'activarà a la Fase 4.

## Desplegar a Vercel

1. A Vercel: **Add New → Project** → importa el repo `1abcdse/web-padel-events`.
2. **Root Directory:** `apps/academy` (la resta de config ja és a `vercel.json`).
3. Afegeix les variables d'entorn de `.env.example`.
4. Deploy. Cada push a la branca crea una previsualització.

## Fases

1. ✅ Setup + sistema de disseny + `/styleguide`
2. Layout (header, footer, menú mòbil, CTA fixa, WhatsApp) + Home
3. Experiències, formats i detall de pack
4. Configurador de reserva + emails
5. Pàgines restants, i18n, SEO, legals, cookies
6. Rendiment, accessibilitat i desplegament
