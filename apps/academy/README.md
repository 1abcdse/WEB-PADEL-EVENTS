# Padel System Academy — web

Web de **PADEL SYSTEM ACADEMY (PS)**: experiències de pàdel amb allotjament, àpats i entrenament.
L'objectiu és que el client entengui els packs, se n'enamori i **et contacti** (sol·licitud o WhatsApp). No hi ha pagament online: cada reserva és una sol·licitud que gestiones tu.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · next-intl (CA/ES/EN) · React Hook Form + Zod · Resend
- **Idiomes:** català per defecte (`/`), castellà (`/es`) i anglès (`/en`)
- **Lighthouse mòbil (local):** rendiment 94–96 · accessibilitat 100 · bones pràctiques 100

## Arrencar en local

Cal Node 20+ i pnpm. Des de l'arrel del repositori:

```bash
pnpm install
cp apps/academy/.env.example apps/academy/.env.local   # i omple les variables (opcional en local)
pnpm --filter @padel/academy dev                        # http://localhost:3100
```

Altres ordres (`pnpm --filter @padel/academy <ordre>`):

| Ordre | Què fa |
|---|---|
| `dev` | Servidor de desenvolupament |
| `build` / `start` | Build de producció i servidor |
| `typecheck` | Comprovació de tipus |
| `test` | Valida packs i dates (límits de 20 h / 30 h) |

Sense `RESEND_API_KEY`, en local les sol·licituds **no s'envien**: es mostren a la consola del servidor perquè puguis provar tot el flux.

## Estructura

```
apps/academy/
├── messages/{ca,es,en}.json      Textos de la interfície (traduccions)
├── public/brand/                 Logo (⚠️ substitueix pels arxius originals)
└── src/
    ├── app/[locale]/             Pàgines (una carpeta per ruta)
    │   ├── page.tsx              Home
    │   ├── experiencies/         Comparativa, pàgina de format i detall de pack
    │   ├── reserva/              Configurador "Crea la teva experiència"
    │   ├── com-funciona/ academia/ installacions/ faq/ contacte/
    │   ├── legal/[page]/         Avís legal, privacitat, cookies
    │   └── styleguide/           Sistema de disseny (no indexat)
    ├── app/api/sollicitud/       Enviament de sol·licituds i contacte (Resend)
    ├── components/               Components reutilitzables (ui, layout, home, packs, forms)
    ├── content/                  ✏️ TOTES LES DADES EDITABLES (vegeu sota)
    ├── i18n/                     Configuració d'idiomes
    └── lib/                      Utilitats (SEO, Schema.org, WhatsApp, esquema del formulari…)
```

## Com editar el contingut

Tot el contingut del negoci és a `src/content/`. No cal tocar cap component.

| Fitxer | Què hi edites |
|---|---|
| `packs.ts` | Packs: nom, hores, preu "des de" (`priceFrom`), programa dia a dia, què inclou/no inclou, extres |
| `dates.ts` | Properes dates i estat: `disponible`, `poques-places`, `complet` |
| `formats.ts` | Els dos formats (cap de setmana / stage 4 dies) i els seus límits d'hores |
| `extras.ts` | Extres opcionals i preus orientatius |
| `site.ts` | **Correu, telèfon, WhatsApp, adreça, coordenades del mapa, xarxes, dades legals** |
| `faq.ts` | Preguntes freqüents (per categoria; `home: true` surt a la home) |
| `team.ts` / `testimonials.ts` | Equip i testimonis |
| `images.ts` | Fotos del web (vegeu sota) |
| `legal.ts` | Textos legals (model provisional) |

### Preus

A `packs.ts`, canvia `priceFrom: null` pel preu en euros (p. ex. `priceFrom: 290`). Mentre sigui `null`, el web mostra **"XXX €"**. Als extres, `price: null` es mostra com "a consultar".

### Dates

A `dates.ts` afegeix una línia per data. `start` és el primer dia: **dissabte** per al cap de setmana i **divendres** per a l'stage (format `AAAA-MM-DD`). Les dates passades s'amaguen soles (les pàgines es regeneren cada dia).

### Regles que es validen automàticament

`src/content/validate.ts` comprova, i **el build falla** si no es compleixen:

- Cap pack de cap de setmana supera **20 h** (ni **10 h per dia**); cap stage supera **30 h**.
- La suma d'hores del programa dia a dia coincideix amb les hores del pack.
- Les nits del pack coincideixen amb les del format, i els dies del programa existeixen al format.
- Les dates comencen el dia correcte (dissabte / divendres) i els extres existeixen.

Executa `pnpm --filter @padel/academy test` després d'editar.

### Textos de la interfície i traduccions

Els textos fixos (botons, títols de secció…) són a `messages/ca.json`, `es.json` i `en.json`. Els continguts de `src/content` porten les tres versions a cada camp (`{ ca, es, en }`).

## ⚠️ Què cal substituir abans de publicar

1. **Logo:** desa els arxius originals a `public/brand/` (`logo-horizontal.svg`, `logo-icon.svg`). El component `src/components/ui/Logo.tsx` és una recreació provisional; si tens el logo en SVG, substitueix-lo allà també.
2. **Fotos:** a `src/content/images.ts` totes les imatges tenen `src: ""` i es mostra un placeholder gràfic amb l'etiqueta *FOTO · descripció*. Posa-hi la ruta d'una foto pròpia (`/img/hero.jpg` dins de `public/img/`) o una URL d'Unsplash (`https://images.unsplash.com/...`). Per al **vídeo del hero**, hi ha instruccions a `src/components/home/Hero.tsx`.
3. **Dades de contacte i legals:** `src/content/site.ts` (WhatsApp, correu, telèfon, adreça, NIF…).
4. **Preus** (`packs.ts`, `extras.ts`), **equip** (`team.ts`), **testimonis reals** (`testimonials.ts`).
5. **Textos legals** (`legal.ts`) i **política de cancel·lació** (`messages/*.json` → `howItWorks.cancellation`): són models provisionals.

## Configurar Resend (correus)

1. Crea un compte a [resend.com](https://resend.com) i **verifica el teu domini** (Domains → Add domain, i afegeix els registres DNS que t'indiqui).
2. Crea una API key (API Keys → Create).
3. Omple les variables (a `.env.local` en local, o a Vercel):

| Variable | Exemple | Per a què |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Clau de l'API |
| `RESEND_FROM` | `Padel System Academy <reserves@padelsystemacademy.com>` | Remitent (del domini verificat). Per proves: `onboarding@resend.dev` |
| `BOOKING_TO_EMAIL` | `hola@padelsystemacademy.com` | On reps les sol·licituds |
| `NEXT_PUBLIC_SITE_URL` | `https://padelsystemacademy.com` | URL pública (SEO, sitemap, Open Graph) |

Cada sol·licitud envia **dos correus**: un a tu (amb `Reply-To` del client, per respondre directament) i una **confirmació automàtica al client** en el seu idioma. El formulari també ofereix "Envia-ho per WhatsApp" amb el resum ja escrit.

## Desplegar a Vercel

1. Importa el repositori a [vercel.com/new](https://vercel.com/new).
2. A **Root Directory** tria `apps/academy` (Vercel detecta Next.js i pnpm automàticament).
3. A **Environment Variables** afegeix les quatre variables de l'apartat anterior.
4. Deploy. Després, a **Settings → Domains**, connecta el teu domini.

Cada canvi a `src/content/` (preus, dates…) es publica sol en fer push.

## SEO i accessibilitat

- Metadades per pàgina, `hreflang` per idioma, Open Graph (imatge generada a `src/app/opengraph-image.tsx`), `sitemap.xml` i `robots.txt`.
- Dades estructurades: `SportsActivityLocation` (home i instal·lacions), `Product` + `Offer` (cada pack) i `FAQPage`.
- Mòbil primer (provat a 375 px), contrast AA, navegació per teclat, `prefers-reduced-motion` respectat.
- El mapa de Google només es carrega quan l'usuari ho demana (sense cookies de tercers per defecte).
