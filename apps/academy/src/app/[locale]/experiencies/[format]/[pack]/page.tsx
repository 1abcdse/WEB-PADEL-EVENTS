import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  dates,
  extrasById,
  formats,
  getPack,
  packs,
  packsByFormat,
} from "@/content";
import type { ImageKey } from "@/content/images";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { packOfferSchema } from "@/lib/schema";
import { formatPrice, tr, upcoming } from "@/lib/i18n-content";
import { whatsappUrl } from "@/lib/whatsapp";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/layout/PageHero";
import { FormatBadge, Tag } from "@/components/ui/Badge";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { AccordionItem } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { DatesList } from "@/components/packs/DatesList";
import { PackCard } from "@/components/packs/PackCard";

type Props = {
  params: Promise<{ locale: string; format: string; pack: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    packs.map((p) => ({ locale, format: p.format, pack: p.slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, format, pack: slug } = await params;
  const pack = getPack(format, slug);
  if (!pack) return {};
  return pageMetadata({
    locale,
    path: `/experiencies/${format}/${slug}`,
    title: `${pack.name} · ${pack.hours}h`,
    description:
      `${tr(pack.tagline, locale)} ${tr(pack.description, locale)}`.slice(
        0,
        160,
      ),
  });
}

export default async function PackPage({ params }: Props) {
  const { locale, format: formatSlug, pack: slug } = await params;
  const pack = getPack(formatSlug, slug);
  if (!pack) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const format = formats[pack.format];
  const others = packsByFormat(pack.format).filter((p) => p.slug !== pack.slug);
  const packDates = upcoming(dates, pack.format);
  const bookingHref = {
    pathname: "/reserva",
    query: { format: pack.format, pack: pack.slug },
  };
  const gallery: ImageKey[] = [
    pack.image as ImageKey,
    "courts",
    "analysis",
    "food",
  ];

  const stats: { icon: IconName; label: string; value: string }[] = [
    { icon: "clock", label: t("pack.hours"), value: `${pack.hours}h` },
    {
      icon: "bed",
      label: t("pack.nights"),
      value: t("common.nights", { count: pack.nights }),
    },
    {
      icon: "users",
      label: t("pack.group"),
      value: t("common.groupMax", { count: pack.groupSize }),
    },
    {
      icon: "target",
      label: t("pack.level"),
      value: pack.levels.map((l) => t(`common.levels.${l}`)).join(" · "),
    },
  ];

  return (
    <>
      <JsonLd data={packOfferSchema(pack, locale)} />

      <PageHero
        eyebrow={
          <>
            <Link href="/experiencies" className="hover:text-lime">
              {t("pack.breadcrumbExperiences")}
            </Link>
            <span aria-hidden="true">/</span>
            <FormatBadge
              format={pack.format}
              label={tr(format.badge, locale)}
            />
          </>
        }
        title={
          <>
            {pack.name} <span className="text-lime">{pack.hours}h</span>
          </>
        }
        subtitle={tr(pack.tagline, locale)}
        image={pack.image as ImageKey}
        compact
      />

      <div className="on-light bg-stone text-ink">
        <div className="container-brand grid gap-10 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24">
          {/* Contingut */}
          <div className="space-y-16 lg:col-span-8">
            {/* Resum en xifres */}
            <section aria-labelledby="summary-title">
              <h2 id="summary-title" className="sr-only">
                {t("pack.summary")}
              </h2>
              <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-brand bg-ink/10 md:grid-cols-4">
                {stats.map((s) => (
                  <li key={s.label} className="bg-paper p-5">
                    <Icon name={s.icon} className="h-5 w-5" />
                    <p className="mt-3 font-display text-lg font-extrabold leading-tight">
                      {s.value}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">{s.label}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-lg leading-relaxed text-ink/80">
                {tr(pack.description, locale)}
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm text-ink/70">
                <Icon name="meal" className="mt-0.5 h-4 w-4 shrink-0" />
                {tr(pack.meals, locale)}
              </p>
            </section>

            {/* Galeria */}
            <section aria-labelledby="gallery-title">
              <h2 id="gallery-title" className="sr-only">
                {t("pack.galleryTitle")}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <Photo
                  image={gallery[0]!}
                  className="col-span-3 aspect-[16/9] rounded-brand"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
                {gallery.slice(1).map((g) => (
                  <Photo
                    key={g}
                    image={g}
                    className="aspect-square rounded-brand"
                    sizes="(min-width: 1024px) 20vw, 33vw"
                  />
                ))}
              </div>
            </section>

            {/* Programa dia a dia */}
            <section aria-labelledby="program-title">
              <h2 id="program-title" className="text-h2 font-black italic">
                {t("pack.programTitle")}
              </h2>
              <div className="mt-8 border-t border-ink/15">
                {pack.program.map((day, i) => (
                  <AccordionItem
                    key={day.day}
                    light
                    defaultOpen={i === 0}
                    title={
                      <>
                        <span className="eyebrow mr-3 !text-[0.7rem] text-ink/65">
                          {t(`common.daysLong.${day.day}`)}
                        </span>
                        {tr(day.title, locale)}
                      </>
                    }
                    meta={<Tag tone="ink">{day.hours}h</Tag>}
                  >
                    <ul className="space-y-2.5">
                      {day.items.map((item, j) => (
                        <li key={j} className="flex gap-3">
                          <span
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ink"
                            aria-hidden="true"
                          />
                          {tr(item, locale)}
                        </li>
                      ))}
                    </ul>
                  </AccordionItem>
                ))}
              </div>
            </section>

            {/* Inclou / no inclou */}
            <section
              className="grid gap-5 md:grid-cols-2"
              aria-label={`${t("pack.includesTitle")} / ${t("pack.excludesTitle")}`}
            >
              <div className="rounded-brand bg-ink p-7 text-paper">
                <h2 className="text-h3 font-black italic">
                  {t("pack.includesTitle")}
                </h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {pack.includes.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Icon
                        name="check"
                        className="h-5 w-5 shrink-0 text-lime"
                      />
                      {tr(item, locale)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-brand bg-paper p-7">
                <h2 className="text-h3 font-black italic">
                  {t("pack.excludesTitle")}
                </h2>
                <ul className="mt-5 space-y-3 text-sm text-ink/75">
                  {pack.excludes.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Icon name="x" className="h-5 w-5 shrink-0 text-ink/40" />
                      {tr(item, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Extres */}
            <section aria-labelledby="extras-title">
              <h2 id="extras-title" className="text-h2 font-black italic">
                {t("pack.extrasTitle")}
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {pack.extras.map((id) => {
                  const extra = extrasById[id]!;
                  return (
                    <li
                      key={id}
                      className="flex items-start justify-between gap-4 rounded-brand bg-paper p-5"
                    >
                      <div>
                        <p className="font-display font-extrabold uppercase">
                          {tr(extra.name, locale)}
                        </p>
                        <p className="mt-1 text-sm text-ink/65">
                          {tr(extra.description, locale)}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-xs text-ink/60">
                        <span className="block font-display text-sm font-bold text-ink">
                          {extra.price === null
                            ? t("common.onRequest")
                            : formatPrice(extra.price, locale)}
                        </span>
                        {tr(extra.unit, locale)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Dates */}
            <section aria-labelledby="dates-title">
              <h2 id="dates-title" className="text-h2 font-black italic">
                {t("pack.datesTitle")}
              </h2>
              <div className="mt-8">
                <DatesList dates={packDates} pack={pack.slug} light />
              </div>
            </section>
          </div>

          {/* Targeta lateral sticky */}
          <aside className="lg:col-span-4">
            <div className="lime-stripe sticky top-[calc(var(--header-h)+24px)] overflow-hidden rounded-brand bg-ink p-7 text-paper shadow-2xl">
              <FormatBadge
                format={pack.format}
                label={tr(format.badge, locale)}
              />
              <p className="mt-6 font-display text-2xl font-black uppercase italic">
                {pack.name}
              </p>
              <p className="mt-1 font-display text-6xl font-black italic text-lime">
                {pack.hours}h
              </p>
              <p className="eyebrow mt-6 text-paper/50">
                {t("pack.asideTitle")}
              </p>
              <p className="mt-1">
                <span className="text-sm text-paper/60">
                  {t("common.from")}{" "}
                </span>
                <span className="font-display text-4xl font-extrabold">
                  {formatPrice(pack.priceFrom, locale)}
                </span>
              </p>
              <ul className="mt-6 space-y-2 border-t border-paper/10 pt-6 text-sm text-paper/80">
                <li className="flex gap-2">
                  <Icon name="bed" className="h-4 w-4 text-lime" />{" "}
                  {t("common.nights", { count: pack.nights })}
                </li>
                <li className="flex gap-2">
                  <Icon name="meal" className="h-4 w-4 text-lime" />{" "}
                  {t("common.fullBoard")}
                </li>
                <li className="flex gap-2">
                  <Icon name="racket" className="h-4 w-4 text-lime" />{" "}
                  {pack.hours} {t("common.hoursOfPadel")}
                </li>
              </ul>
              <ButtonLink href={bookingHref} className="mt-8 w-full" size="lg">
                {t("pack.asideCta")}
              </ButtonLink>
              <ButtonA
                href={whatsappUrl(
                  t("common.whatsappPack", { pack: pack.name }),
                )}
                variant="secondary"
                className="mt-3 w-full"
                icon={null}
                iconStart="whatsapp"
              >
                {t("pack.asideWhatsapp")}
              </ButtonA>
              <p className="mt-5 text-center text-xs text-paper/50">
                {t("pack.asideNote")}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Altres packs */}
      <section className="bg-ink py-20 sm:py-28" aria-labelledby="others-title">
        <div className="container-brand">
          <h2 id="others-title" className="mb-10 text-h2 font-black italic">
            {t("pack.otherPacks")}
          </h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {others.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.06}>
                <PackCard pack={p} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
