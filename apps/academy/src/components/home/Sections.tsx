import { useLocale, useTranslations } from "next-intl";
import { team } from "@/content/team";
import { testimonials } from "@/content/testimonials";
import type { ImageKey } from "@/content/images";
import { tr } from "@/lib/i18n-content";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

/* ── Què inclou cada experiència ── */
export function IncludesGrid() {
  const t = useTranslations("home.includes");
  const items: {
    key: "padel" | "stay" | "meals" | "analysis";
    icon: IconName;
  }[] = [
    { key: "padel", icon: "racket" },
    { key: "stay", icon: "bed" },
    { key: "meals", icon: "meal" },
    { key: "analysis", icon: "chart" },
  ];
  return (
    <ul className="grid gap-px overflow-hidden rounded-brand bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <Reveal
          as="li"
          key={item.key}
          delay={i * 0.06}
          className="bg-stone p-7 sm:p-8"
        >
          <span className="skew-box flex h-14 w-14 items-center justify-center rounded-[4px] bg-ink text-lime">
            <Icon name={item.icon} className="h-7 w-7" />
          </span>
          <h3 className="mt-6 text-h3 font-black italic">
            {t(`${item.key}.title`)}
          </h3>
          <p className="mt-3 text-ink/70">{t(`${item.key}.text`)}</p>
        </Reveal>
      ))}
    </ul>
  );
}

/* ── El mètode PS: 4 passos numerats ── */
export function MethodSteps({ light = false }: { light?: boolean }) {
  const t = useTranslations("home.method.steps");
  const steps = ["1", "2", "3", "4"] as const;
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((n, i) => (
        <Reveal
          as="li"
          key={n}
          delay={i * 0.08}
          className={cn(
            "relative rounded-brand p-7 sm:p-8",
            light ? "bg-paper" : "bg-graphite",
          )}
        >
          <span className="skew-box inline-flex h-16 min-w-16 items-center justify-center rounded-[4px] bg-lime px-3 text-ink">
            <span className="font-display text-3xl font-black italic">
              0{n}
            </span>
          </span>
          {i < steps.length - 1 && (
            <Icon
              name="arrow"
              className="absolute right-6 top-11 hidden h-5 w-5 text-lime/60 lg:block"
            />
          )}
          <h3 className="mt-6 text-h3 font-black italic">{t(`${n}.title`)}</h3>
          <p className={cn("mt-3", light ? "text-ink/70" : "text-paper/70")}>
            {t(`${n}.text`)}
          </p>
        </Reveal>
      ))}
    </ol>
  );
}

/* ── Un dia a l'acadèmia: timeline horari ── */
const DAY = [
  "0900",
  "0930",
  "1130",
  "1330",
  "1600",
  "1800",
  "1930",
  "2100",
] as const;
const PADEL_SLOTS = new Set(["0930", "1130", "1600", "1800"]);

export function DayTimeline() {
  const t = useTranslations("home.day.items");
  return (
    <ol className="relative grid gap-0 border-l border-paper/15 pl-8 md:grid-cols-4 md:gap-y-12 md:border-l-0 md:border-t md:pl-0 md:pt-0">
      {DAY.map((slot, i) => {
        const padel = PADEL_SLOTS.has(slot);
        return (
          <Reveal
            as="li"
            key={slot}
            delay={(i % 4) * 0.06}
            className="relative pb-9 md:pr-6 md:pt-9"
          >
            <span
              className={cn(
                "absolute -left-[41px] top-1 h-[17px] w-[17px] rounded-full ring-4 ring-ink md:-top-[9px] md:left-0",
                padel ? "bg-lime" : "bg-paper/40",
              )}
              aria-hidden="true"
            />
            <p className="font-display text-3xl font-black italic text-paper sm:text-4xl">
              {slot.slice(0, 2)}:{slot.slice(2)}
            </p>
            <p
              className={cn(
                "mt-1 font-medium",
                padel ? "text-lime" : "text-paper/70",
              )}
            >
              {t(slot)}
            </p>
          </Reveal>
        );
      })}
    </ol>
  );
}

/* ── Equip: foto B/N que passa a color en hover ── */
export function TeamGrid() {
  const locale = useLocale();
  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {team.map((coach, i) => (
        <Reveal as="li" key={i} delay={(i % 4) * 0.06}>
          <article className="group">
            <Photo
              image={coach.image}
              grayscaleHover
              className="aspect-[4/5] rounded-brand"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <h3 className="mt-4 font-display text-base font-extrabold uppercase sm:text-lg">
              {coach.name}
            </h3>
            <p className="eyebrow mt-1 !text-[0.62rem] text-lime">
              {tr(coach.role, locale)}
            </p>
            <p className="mt-2 hidden text-sm text-paper/65 sm:block">
              {tr(coach.bio, locale)}
            </p>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}

/* ── Testimonis ── */
export function Testimonials() {
  const t = useTranslations("home.testimonials");
  const locale = useLocale();
  return (
    <ul className="grid gap-5 lg:grid-cols-3">
      {testimonials.map((item, i) => (
        <Reveal as="li" key={i} delay={i * 0.08} className="flex">
          <figure className="lime-stripe flex w-full flex-col overflow-hidden rounded-brand bg-paper p-7 pb-9 text-ink sm:p-8 sm:pb-10">
            <div
              className="flex gap-1 text-ink"
              role="img"
              aria-label={t("rating", { rating: item.rating })}
            >
              {Array.from({ length: 5 }, (_, s) => (
                <Icon
                  key={s}
                  name="star"
                  className={cn(
                    "h-4 w-4",
                    s < item.rating ? "fill-ink" : "opacity-25",
                  )}
                />
              ))}
            </div>
            <blockquote className="mt-5 flex-1 font-display text-lg font-semibold leading-snug sm:text-xl">
              “{tr(item.quote, locale)}”
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="font-bold">{item.name}</span> · {item.origin}
              <span className="eyebrow mt-1 block !text-[0.6rem] text-ink/60">
                {item.pack}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}

/* ── Galeria masonry ── */
const GALLERY: { image: ImageKey; ratio: string }[] = [
  { image: "gallery1", ratio: "aspect-[4/5]" },
  { image: "gallery2", ratio: "aspect-[4/3]" },
  { image: "gallery3", ratio: "aspect-square" },
  { image: "gallery4", ratio: "aspect-[3/4]" },
  { image: "gallery5", ratio: "aspect-[4/3]" },
  { image: "gallery6", ratio: "aspect-[4/5]" },
  { image: "gallery7", ratio: "aspect-square" },
  { image: "courts", ratio: "aspect-[4/3]" },
];

export function Gallery({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-2 gap-3 sm:gap-4 lg:columns-4">
      {GALLERY.slice(0, count).map((g) => (
        <Reveal key={g.image} className="mb-3 break-inside-avoid sm:mb-4">
          <Photo
            image={g.image}
            className={cn(g.ratio, "rounded-brand")}
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </Reveal>
      ))}
    </div>
  );
}

/* ── CTA final a pantalla completa ── */
export function FinalCta() {
  const t = useTranslations("home.finalCta");
  const tc = useTranslations("common");
  return (
    <section className="lime-stripe relative isolate overflow-hidden bg-ink py-28 sm:py-40">
      {/* "PS" decoratiu gegant (pseudo-element: no és text real) */}
      <span
        className="pointer-events-none absolute -right-10 top-1/2 -z-10 -translate-y-1/2 select-none font-display text-[38vw] font-black italic leading-none text-paper/[0.03] before:content-['PS']"
        aria-hidden="true"
      />
      <div className="container-brand">
        <Reveal>
          <h2 className="max-w-5xl text-display font-black italic">
            {t("title")} <span className="text-lime">{t("titleAccent")}</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-paper/75">{t("subtitle")}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/reserva" size="lg">
              {t("cta")}
            </ButtonLink>
            <ButtonA
              href={whatsappUrl(tc("whatsappGeneric"))}
              variant="secondary"
              size="lg"
              icon={null}
              iconStart="whatsapp"
            >
              WhatsApp
            </ButtonA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
