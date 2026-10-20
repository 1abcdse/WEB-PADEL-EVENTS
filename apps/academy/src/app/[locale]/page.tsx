import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { BOOK_HREF } from "@/content/nav";
import { Button } from "@/components/ui/Button";
import { Ball } from "@/components/ui/Ball";
import { Eyebrow, SkewTag } from "@/components/ui/Brand";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Counter, FadeIn } from "@/components/ui/Motion";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { FormatCard } from "@/components/cards/FormatCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PacksExplorer } from "@/components/sections/PacksExplorer";

const WRAP = "mx-auto max-w-7xl px-5 sm:px-8";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const tp = useTranslations("photo");

  const includes: { icon: IconName; key: "padel" | "stay" | "meals" | "tracking" }[] = [
    { icon: "racket", key: "padel" },
    { icon: "bed", key: "stay" },
    { icon: "meal", key: "meals" },
    { icon: "chart", key: "tracking" },
  ];
  const steps = ["s1", "s2", "s3", "s4"] as const;
  const day = [
    ["08:00", "t0800"], ["09:00", "t0900"], ["09:30", "t0930"], ["12:00", "t1200"], ["13:30", "t1330"],
    ["15:00", "t1500"], ["16:30", "t1630"], ["18:30", "t1830"], ["21:00", "t2100"],
  ] as const;
  const padelSlots = new Set(["t0930", "t1200", "t1630", "t1830"]);
  const faqs = ["1", "2", "3", "4", "5"] as const;

  return (
    <main>
      {/* 1 · HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <PhotoSlot label={tp("hero")} className="absolute inset-0 -z-10 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/55" />
        <div className={`${WRAP} flex min-h-[88svh] flex-col justify-end gap-8 pb-16 pt-32 sm:pb-20`}>
          <Eyebrow className="text-lime">{t("hero.eyebrow")}</Eyebrow>
          <h1 className="max-w-5xl font-display text-hero font-black uppercase italic [text-wrap:balance]">
            {t("hero.title")}
          </h1>
          <p className="max-w-xl text-lg text-paper/85 sm:text-xl">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap gap-4">
            <Button href="/experiencies" size="lg">{tc("discoverPacks")}</Button>
            <Button href="/contacte" variant="secondary" size="lg" icon="whatsapp">{tc("talkToUs")}</Button>
          </div>
          <a href="#xifres" className="ps-eyebrow mt-4 inline-flex items-center gap-3 self-start text-paper/70 hover:text-paper">
            <Ball size={18} className="animate-bounce motion-reduce:animate-none" />
            {t("hero.scroll")}
          </a>
        </div>
      </section>

      {/* 2 · BARRA DE XIFRES */}
      <section id="xifres" className="bg-lime text-ink">
        <div className={`${WRAP} grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4`}>
          <div>
            <Counter value={20} suffix="h" className="font-display text-giant font-black italic" />
            <p className="ps-eyebrow mt-2">{t("stats.weekend")}</p>
          </div>
          <div>
            <Counter value={30} suffix="h" className="font-display text-giant font-black italic" />
            <p className="ps-eyebrow mt-2">{t("stats.stage")}</p>
          </div>
          <div className="flex flex-col justify-end">
            <p className="font-display text-title font-black uppercase italic">{t("stats.allIn")}</p>
            <p className="ps-eyebrow mt-2">{t("stats.allInSub")}</p>
          </div>
          <div className="flex flex-col justify-end">
            <p className="font-display text-title font-black uppercase italic">{t("stats.groups")}</p>
            <p className="ps-eyebrow mt-2">{t("stats.groupsSub")}</p>
          </div>
        </div>
      </section>

      {/* 3 · TRIA EL TEU FORMAT */}
      <section className="bg-stone">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn><SectionHeading eyebrow={t("formats.eyebrow")} title={t("formats.title")} className="mb-12" /></FadeIn>
          <div className="grid gap-5 lg:grid-cols-2">
            <FadeIn><FormatCard format="weekend" /></FadeIn>
            <FadeIn delay={0.1}><FormatCard format="stage" /></FadeIn>
          </div>
        </div>
      </section>

      {/* 4 · QUÈ INCLOU */}
      <section className="bg-paper">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn><SectionHeading eyebrow={t("includes.eyebrow")} title={t("includes.title")} className="mb-12" /></FadeIn>
          <ul className="grid gap-px overflow-hidden rounded-brand bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {includes.map((i, n) => (
              <li key={i.key} className="bg-paper p-7">
                <FadeIn delay={n * 0.06}>
                  <span className="ps-skew grid size-14 place-items-center rounded-[4px] bg-ink text-lime">
                    <span className="ps-unskew"><Icon name={i.icon} size={26} /></span>
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-black uppercase italic">{t(`includes.${i.key}`)}</h3>
                  <p className="mt-3 text-mute-strong">{t(`includes.${i.key}Text`)}</p>
                </FadeIn>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 · PACKS */}
      <section className="bg-ink text-paper">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow={t("packs.eyebrow")} title={t("packs.title")} surface="dark" />
              <Link href="/experiencies" className="ps-eyebrow text-lime underline-offset-4 hover:underline">
                {t("packs.seeAll")} →
              </Link>
            </div>
          </FadeIn>
          <PacksExplorer />
        </div>
      </section>

      {/* 6 · EL MÈTODE PS */}
      <section className="bg-paper">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn><SectionHeading eyebrow={t("method.eyebrow")} title={t("method.title")} intro={t("method.intro")} className="mb-14" /></FadeIn>
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, n) => (
              <li key={s} className="relative flex flex-col overflow-hidden rounded-brand bg-ink p-7 text-paper">
                <FadeIn delay={n * 0.08}>
                  <span className="font-display text-7xl font-black italic text-lime" aria-hidden="true">{n + 1}</span>
                  <h3 className="mt-4 font-display text-2xl font-black uppercase italic">
                    <span className="sr-only">{n + 1}. </span>{t(`method.${s}`)}
                  </h3>
                  <p className="mt-3 text-paper/75">{t(`method.${s}Text`)}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 · UN DIA A L'ACADÈMIA */}
      <section className="bg-stone">
        <div className={`${WRAP} grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr]`}>
          <FadeIn>
            <SectionHeading eyebrow={t("day.eyebrow")} title={t("day.title")} />
            <p className="mt-6 max-w-md text-mute-strong">{t("day.note")}</p>
          </FadeIn>
          <ol className="relative border-l-[3px] border-ink">
            {day.map(([time, key]) => {
              const padel = padelSlots.has(key);
              return (
                <li key={key} className="relative pb-6 pl-8 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[9px] top-1.5 size-4 rounded-full ${padel ? "bg-lime ring-2 ring-ink" : "bg-ink"}`}
                  />
                  <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="w-16 font-display text-xl font-black italic tabular-nums">{time}</span>
                    <span className={`text-lg ${padel ? "font-semibold" : "text-mute-strong"}`}>{t(`day.${key}`)}</span>
                    {padel && <SkewTag tone="ink" className="text-[0.6rem]">{t("includes.padel")}</SkewTag>}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 8 · EQUIP */}
      <section className="bg-ink text-paper">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn><SectionHeading eyebrow={t("team.eyebrow")} title={t("team.title")} surface="dark" className="mb-12" /></FadeIn>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(["role1", "role2", "role3"] as const).map((r) => (
              <li key={r} className="group overflow-hidden rounded-brand bg-graphite">
                <PhotoSlot
                  label={tp("coach")}
                  grayscale
                  className="aspect-[4/5] w-full transition-[filter] duration-500 group-hover:grayscale-0"
                />
                <div className="p-6">
                  <p className="font-display text-2xl font-black uppercase italic">[Nom]</p>
                  <p className="ps-eyebrow mt-2 text-lime">{t(`team.${r}`)}</p>
                  <p className="mt-3 text-sm text-paper/60">{t("team.placeholder")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9 · TESTIMONIS */}
      <section className="bg-paper">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn><SectionHeading eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} intro={t("testimonials.note")} className="mb-12" /></FadeIn>
          <ul className="grid gap-5 md:grid-cols-3">
            {(["q1", "q2", "q3"] as const).map((q) => (
              <li key={q}>
                <figure className="flex h-full flex-col gap-6 rounded-brand border-2 border-dashed border-ink/25 p-7">
                  <div className="flex items-center justify-between">
                    <p className="flex gap-1 text-ink" aria-hidden="true">{"★★★★★"}</p>
                    <SkewTag tone="ink">{t("testimonials.example")}</SkewTag>
                  </div>
                  <blockquote className="flex-1 text-lg italic text-mute-strong">{t(`testimonials.${q}`)}</blockquote>
                  <figcaption className="ps-eyebrow">{t("testimonials.name")}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10 · GALERIA */}
      <section className="bg-ink text-paper">
        <div className={`${WRAP} py-20 sm:py-28`}>
          <FadeIn><SectionHeading eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} surface="dark" className="mb-12" /></FadeIn>
          <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
            <PhotoSlot label={tp("match")} className="aspect-[3/4] w-full break-inside-avoid rounded-brand" />
            <PhotoSlot label={tp("group")} className="aspect-square w-full break-inside-avoid rounded-brand" />
            <PhotoSlot label={tp("stay")} className="aspect-[4/3] w-full break-inside-avoid rounded-brand" />
            <PhotoSlot label={tp("detail")} className="aspect-square w-full break-inside-avoid rounded-brand" />
            <PhotoSlot label={tp("food")} className="aspect-[3/4] w-full break-inside-avoid rounded-brand" />
            <PhotoSlot label={tp("court")} className="aspect-[4/3] w-full break-inside-avoid rounded-brand" />
          </div>
        </div>
      </section>

      {/* 11 · FAQ */}
      <section className="bg-stone">
        <div className={`${WRAP} grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.4fr]`}>
          <FadeIn>
            <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
            <Link href="/faq" className="ps-eyebrow mt-8 inline-block underline underline-offset-4">
              {t("faq.more")} →
            </Link>
          </FadeIn>
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {faqs.map((n) => (
              <details key={n} className="group py-2">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-extrabold uppercase italic [&::-webkit-details-marker]:hidden">
                  {t(`faq.q${n}`)}
                  <span aria-hidden="true" className="ps-skew grid size-8 shrink-0 place-items-center rounded-[3px] bg-ink text-lime transition-transform group-open:rotate-45">
                    <span className="ps-unskew text-xl leading-none">+</span>
                  </span>
                </summary>
                <p className="pb-4 pr-12 text-mute-strong">{t(`faq.a${n}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12 · CTA FINAL */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className={`${WRAP} flex flex-col items-start gap-8 py-24 sm:py-32`}>
          <h2 className="max-w-5xl font-display text-display font-black uppercase italic [text-wrap:balance]">
            {t("finalCta.title")}
          </h2>
          <p className="max-w-xl text-lg text-paper/80">{t("finalCta.subtitle")}</p>
          <Button href={BOOK_HREF} size="lg">{tc("requestSpot")}</Button>
        </div>
      </section>
    </main>
  );
}
