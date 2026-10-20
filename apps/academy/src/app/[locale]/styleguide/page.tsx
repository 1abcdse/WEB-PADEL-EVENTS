import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PACKS } from "@/content/packs";
import { Logo } from "@/components/brand/Logo";
import { PackCard } from "@/components/cards/PackCard";
import { FormatCard } from "@/components/cards/FormatCard";
import { Button } from "@/components/ui/Button";
import { Ball } from "@/components/ui/Ball";
import { Eyebrow, FormatBadge, LimeBar, SkewTag, VDivider } from "@/components/ui/Brand";
import { DayStrip } from "@/components/ui/DayStrip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Counter, FadeIn } from "@/components/ui/Motion";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLORS = [
  { token: "ink", hex: "#0B0B0B", use: "Fons de seccions fosques, text", swatch: "bg-ink", text: "text-paper" },
  { token: "lime", hex: "#D6FF2E", use: "Accent únic: CTA, ressaltats, franges, xifres", swatch: "bg-lime", text: "text-ink" },
  { token: "paper", hex: "#FFFFFF", use: "Fons clar, text sobre negre", swatch: "bg-paper border border-ink/10", text: "text-ink" },
  { token: "stone", hex: "#ECECE7", use: "Fons secundari càlid", swatch: "bg-stone", text: "text-ink" },
  { token: "graphite", hex: "#1A1A1A", use: "Targetes sobre fons negre", swatch: "bg-graphite", text: "text-paper" },
  { token: "mute", hex: "#8A8A85", use: "Text secundari sobre negre", swatch: "bg-mute", text: "text-ink" },
] as const;

const ICONS: IconName[] = ["racket", "bed", "meal", "chart", "clock", "moon", "users", "calendar", "check", "arrow", "whatsapp"];

function Section({ id, title, children, dark = false }: { id: string; title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section id={id} className={dark ? "bg-ink text-paper" : "bg-paper text-ink"}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <FadeIn>
          <div className="mb-10 flex items-center gap-4">
            <Ball size={18} />
            <h2 className="font-display text-title font-black uppercase italic">{title}</h2>
          </div>
          {children}
        </FadeIn>
      </div>
    </section>
  );
}

export default function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main>
      {/* Capçalera */}
      <header className="bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
          <Logo tone="dark" className="w-72 sm:w-96" />
          <div className="flex flex-wrap items-center gap-4">
            <SkewTag tone="lime">Styleguide · Fase 1</SkewTag>
            <nav aria-label="Idioma" className="flex gap-3 text-sm">
              {routing.locales.map((l) => (
                <Link
                  key={l}
                  href="/styleguide"
                  locale={l}
                  className={`ps-eyebrow rounded-[3px] px-2 py-1 ${l === locale ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"}`}
                >
                  {l}
                </Link>
              ))}
            </nav>
          </div>
          <p className="max-w-2xl text-paper/80">
            Tots els elements visuals de la web en un sol lloc. Revisa'ls abans de construir les pàgines: colors,
            tipografia, botons, badges, xifres i targetes. Els textos de les targetes canvien amb l&apos;idioma.
          </p>
        </div>
        <LimeBar />
      </header>

      {/* Logos */}
      <Section id="logo" title="Logo">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid min-h-48 place-items-center rounded-brand bg-paper p-8 ring-1 ring-ink/10">
            <Logo tone="light" className="w-full max-w-sm" />
          </div>
          <div className="grid min-h-48 place-items-center rounded-brand bg-ink p-8">
            <Logo tone="dark" className="w-full max-w-sm" />
          </div>
          <div className="grid min-h-48 place-items-center rounded-brand bg-stone p-8">
            <Logo variant="mark" tone="light" className="w-40" />
          </div>
          <div className="grid min-h-48 place-items-center rounded-brand bg-stone p-8">
            <div className="grid size-32 place-items-center rounded-[26px] bg-ink">
              <Logo variant="mark" tone="dark" className="w-24" />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-mute-strong">
          Fitxers SVG a <code>public/brand/</code>: horitzontal, horitzontal negatiu, marca, marca negativa i icona d&apos;app.
        </p>
      </Section>

      {/* Colors */}
      <Section id="colors" title="Colors" dark>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {COLORS.map((c) => (
            <div key={c.token} className="overflow-hidden rounded-brand bg-graphite">
              <div className={`flex h-28 items-end p-4 ${c.swatch} ${c.text}`}>
                <span className="font-display text-xl font-black italic">{c.token}</span>
              </div>
              <div className="p-4 text-sm">
                <p className="font-mono text-lime">{c.hex}</p>
                <p className="mt-1 text-paper/75">{c.use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-paper/80">
          <strong className="text-lime">Regla d&apos;or:</strong> el llima és escàs i valuós. Només per a accions i dades
          clau, i sempre sobre negre: mai text llarg en llima sobre blanc.
        </p>
      </Section>

      {/* Tipografia */}
      <Section id="tipografia" title="Tipografia">
        <div className="space-y-10">
          <div>
            <Eyebrow className="mb-3 text-mute-strong">Hero · Archivo 900 cursiva</Eyebrow>
            <p className="font-display text-hero font-black uppercase italic">Entrena com un pro.</p>
          </div>
          <div>
            <Eyebrow className="mb-3 text-mute-strong">Display · Archivo 900 cursiva</Eyebrow>
            <p className="font-display text-display font-black uppercase italic">Tria el teu format</p>
          </div>
          <div>
            <Eyebrow className="mb-3 text-mute-strong">Títol · Archivo 900</Eyebrow>
            <p className="font-display text-title font-black uppercase">Què inclou cada experiència</p>
          </div>
          <div>
            <Eyebrow className="mb-3 text-mute-strong">Eyebrow · Archivo 600, tracking 0.25em</Eyebrow>
            <Eyebrow>Places limitades per cap de setmana</Eyebrow>
          </div>
          <div className="max-w-2xl">
            <Eyebrow className="mb-3 text-mute-strong">Cos · Inter 400/500</Eyebrow>
            <p className="text-lg">
              Allotjament, àpats i hores de pàdel en un sol pack. Tu només has de venir a jugar: nosaltres ens encarreguem
              de la resta perquè cada minut a pista compti.
            </p>
          </div>
        </div>
      </Section>

      {/* Botons */}
      <Section id="botons" title="Botons" dark>
        <div className="flex flex-wrap items-center gap-5">
          <Button href="/reserva" size="lg">Demana la teva plaça</Button>
          <Button href="/experiencies">Descobreix els packs</Button>
          <Button href="/contacte" variant="secondary">Parla amb nosaltres</Button>
          <Button href="https://wa.me/34640226321" external variant="secondary" icon="whatsapp">
            WhatsApp
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-5 rounded-brand bg-paper p-6">
          <Button href="/reserva">Primari sobre blanc</Button>
          <Button href="/contacte" variant="secondary" surface="light">Secundari sobre blanc</Button>
        </div>
      </Section>

      {/* Elements de marca */}
      <Section id="elements" title="Elements de marca">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <Eyebrow className="text-mute-strong">Badges de format</Eyebrow>
            <div className="flex flex-wrap gap-3">
              <FormatBadge format="weekend" />
              <FormatBadge format="stage" />
            </div>
          </div>
          <div className="space-y-4">
            <Eyebrow className="text-mute-strong">Etiquetes inclinades</Eyebrow>
            <div className="flex flex-wrap gap-3">
              <SkewTag tone="ink">Poques places</SkewTag>
              <SkewTag tone="lime">Nou</SkewTag>
              <SkewTag tone="paper" className="ring-1 ring-ink/20">Complet</SkewTag>
            </div>
          </div>
          <div className="space-y-4">
            <Eyebrow className="text-mute-strong">Calendari de dies</Eyebrow>
            <div className="space-y-3 rounded-brand bg-ink p-5">
              <DayStrip active={["sat", "sun"]} />
              <DayStrip active={["fri", "sat", "sun", "mon"]} />
            </div>
          </div>
          <div className="space-y-4">
            <Eyebrow className="text-mute-strong">Franja, separador i pilota</Eyebrow>
            <div className="space-y-5">
              <LimeBar />
              <div className="flex h-12 items-center gap-5">
                <span className="font-display font-black italic">PS</span>
                <VDivider />
                <span className="ps-eyebrow">Padel System Academy</span>
              </div>
              <div className="flex items-center gap-4">
                <Ball size={12} />
                <Ball size={20} />
                <Ball size={32} />
                <Ball size={48} />
              </div>
            </div>
          </div>
          <div className="space-y-4 md:col-span-2">
            <Eyebrow className="text-mute-strong">Icones</Eyebrow>
            <ul className="flex flex-wrap gap-3">
              {ICONS.map((n) => (
                <li key={n} className="grid size-14 place-items-center rounded-brand bg-ink text-lime" title={n}>
                  <Icon name={n} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Xifres gegants */}
      <section className="bg-lime text-ink">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 sm:px-8 md:grid-cols-4">
          {[
            { v: 20, s: "h", l: "en un cap de setmana" },
            { v: 30, s: "h", l: "en 4 dies" },
            { v: 2, s: "", l: "dies de clinic" },
            { v: 4, s: "", l: "dies de stage" },
          ].map((x) => (
            <div key={x.l}>
              <Counter value={x.v} suffix={x.s} className="font-display text-giant font-black italic" />
              <p className="ps-eyebrow mt-2">{x.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Targetes de format */}
      <Section id="formats" title="Targetes de format">
        <div className="grid gap-5 lg:grid-cols-2">
          <FormatCard format="weekend" />
          <FormatCard format="stage" />
        </div>
      </Section>

      {/* Targetes de pack */}
      <Section id="packs" title="Targetes de pack" dark>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PACKS.map((p) => (
            <PackCard key={`${p.format}-${p.slug}`} pack={p} />
          ))}
        </div>
        <p className="mt-6 text-sm text-paper/70">
          Dades de <code>src/content/packs.ts</code>. Els enllaços &quot;Veure el pack&quot; s&apos;activaran a la Fase 3.
        </p>
      </Section>
    </main>
  );
}
