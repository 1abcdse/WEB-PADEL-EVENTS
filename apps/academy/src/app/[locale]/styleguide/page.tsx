import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { packs } from "@/content";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormatBadge, Tag } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { Counter } from "@/components/ui/Counter";
import { PackCard } from "@/components/packs/PackCard";
import { DayCalendar } from "@/components/packs/DayCalendar";
import { AccordionItem } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLORS = [
  {
    token: "ink",
    hex: "#0B0B0B",
    use: "Fons fosc, text",
    cls: "bg-ink ring-1 ring-paper/20",
  },
  {
    token: "lime",
    hex: "#D6FF2E",
    use: "Accent únic: CTA i xifres",
    cls: "bg-lime",
  },
  {
    token: "paper",
    hex: "#FFFFFF",
    use: "Fons clar, text sobre negre",
    cls: "bg-paper",
  },
  {
    token: "stone",
    hex: "#ECECE7",
    use: "Fons secundari càlid",
    cls: "bg-stone",
  },
  {
    token: "graphite",
    hex: "#1A1A1A",
    use: "Targetes sobre negre",
    cls: "bg-graphite ring-1 ring-paper/20",
  },
  { token: "mute", hex: "#8A8A85", use: "Text secundari", cls: "bg-mute" },
];

const ICONS: IconName[] = [
  "racket",
  "bed",
  "meal",
  "chart",
  "calendar",
  "bolt",
  "clock",
  "users",
  "target",
  "video",
  "shield",
  "pin",
  "whatsapp",
];

/** Pàgina interna per revisar el sistema de disseny (no indexada) */
export default async function StyleguidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pb-24 pt-[calc(var(--header-h)+48px)]">
      <div className="container-brand space-y-20">
        <header>
          <p className="eyebrow text-lime">Sistema de disseny</p>
          <h1 className="mt-3 text-display font-black italic">Styleguide PS</h1>
          <p className="mt-4 max-w-2xl text-paper/70">
            Tokens, tipografia i components base. Regla d&apos;or: el llima és
            escàs i valuós — només per a accions i dades clau, i sempre sobre
            negre.
          </p>
        </header>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Logo</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-center rounded-brand bg-graphite p-10">
              <Logo />
            </div>
            <div className="flex items-center justify-center rounded-brand bg-paper p-10">
              <Logo tone="dark" />
            </div>
            <div className="flex items-center justify-center gap-6 rounded-brand bg-stone p-10">
              <LogoMark className="h-20" />
              <LogoMark className="h-20" inverted />
            </div>
          </div>
        </section>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Colors</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {COLORS.map((c) => (
              <li key={c.token}>
                <div className={`h-24 rounded-brand ${c.cls}`} />
                <p className="mt-3 font-display font-bold">{c.token}</p>
                <p className="text-xs text-paper/60">
                  {c.hex} · {c.use}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="eyebrow text-paper/50">Tipografia</h2>
          <p className="text-hero font-display font-black uppercase italic">
            Hero 900 italic
          </p>
          <p className="text-display font-black uppercase italic">Display</p>
          <h2 className="text-h2">H2 Archivo 800</h2>
          <h3 className="text-h3">H3 Archivo 800</h3>
          <p className="eyebrow">Eyebrow · Archivo 600 · tracking 0.25em</p>
          <p className="max-w-2xl text-lg">
            Cos de text Inter 400. Textos directes, enèrgics i propers: entrena
            com un pro, viu-ho com una experiència.
          </p>
          <p className="text-giant font-display font-black italic text-lime">
            <Counter value={30} suffix="h" />
          </p>
        </section>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Botons</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primari</Button>
            <Button variant="secondary">Secundari</Button>
            <ButtonLink href="/reserva" size="lg">
              Demana la teva plaça
            </ButtonLink>
            <Button
              size="sm"
              iconStart="whatsapp"
              icon={null}
              variant="secondary"
            >
              WhatsApp
            </Button>
          </div>
          <div className="on-light mt-6 flex flex-wrap items-center gap-4 rounded-brand bg-paper p-6 text-ink">
            <Button variant="ink">Ink</Button>
            <Button variant="outline-ink">Contorn</Button>
          </div>
        </section>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Badges i etiquetes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <FormatBadge format="cap-de-setmana" label="Cap de setmana" />
            <FormatBadge format="stage-4-dies" label="Stage 4 dies" />
            <Tag tone="paper">Més demanat</Tag>
            <Tag tone="outline">Complet</Tag>
          </div>
          <div className="mt-6 flex flex-wrap gap-6">
            <DayCalendar active={["ds", "dg"]} />
            <DayCalendar active={["dv", "ds", "dg", "dl"]} />
          </div>
        </section>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Icones</h2>
          <ul className="flex flex-wrap gap-3">
            {ICONS.map((name) => (
              <li
                key={name}
                className="skew-box flex h-14 w-14 items-center justify-center rounded-[4px] bg-graphite text-lime"
                title={name}
              >
                <Icon name={name} className="h-6 w-6" />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Targetes de pack</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packs.slice(1, 4).map((p) => (
              <PackCard key={p.slug} pack={p} />
            ))}
          </div>
        </section>

        <section className="max-w-2xl">
          <h2 className="eyebrow mb-6 text-paper/50">Acordió</h2>
          <AccordionItem title="Pregunta d'exemple" defaultOpen>
            Resposta amb to directe i proper.
          </AccordionItem>
          <AccordionItem title="Una altra pregunta">Contingut.</AccordionItem>
        </section>

        <section>
          <h2 className="eyebrow mb-6 text-paper/50">Signatura de marca</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="lime-stripe overflow-hidden rounded-brand bg-graphite p-8">
              Franja llima a la base
            </div>
            <div className="flex items-center gap-6 rounded-brand bg-graphite p-8">
              <span className="h-12 w-px bg-paper/40" /> Línia vertical
              separadora
            </div>
            <div className="flex items-center gap-4 rounded-brand bg-graphite p-8">
              <span className="h-4 w-4 rounded-full bg-lime" /> Pilota com a
              micro-detall
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
