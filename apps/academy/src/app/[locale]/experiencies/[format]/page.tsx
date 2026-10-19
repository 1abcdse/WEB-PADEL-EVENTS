import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  dates,
  faqs,
  formatList,
  formats,
  isFormatSlug,
  packsByFormat,
} from "@/content";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { tr, upcoming } from "@/lib/i18n-content";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FormatBadge } from "@/components/ui/Badge";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { DayCalendar } from "@/components/packs/DayCalendar";
import { PackGrid } from "@/components/packs/PackGrid";
import { DatesList } from "@/components/packs/DatesList";
import { FaqList, faqJsonLd } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: string; format: string }> };

export const revalidate = 86400; // amaga dates passades cada dia

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    formatList.map((f) => ({ locale, format: f.slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, format } = await params;
  if (!isFormatSlug(format)) return {};
  const f = formats[format];
  return pageMetadata({
    locale,
    path: `/experiencies/${format}`,
    title: tr(f.name, locale),
    description: tr(f.tagline, locale),
  });
}

export default async function FormatPage({ params }: Props) {
  const { locale, format: slug } = await params;
  if (!isFormatSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const format = formats[slug];
  const formatPacks = packsByFormat(slug);
  const formatFaqs = faqs.filter((f) => f.formats?.includes(slug) || f.home);
  // Programa tipus: el del pack amb més hores del format
  const reference = [...formatPacks].sort((a, b) => b.hours - a.hours)[0]!;

  return (
    <>
      <JsonLd data={faqJsonLd(formatFaqs, locale)} />
      <PageHero
        eyebrow={<FormatBadge format={slug} label={tr(format.badge, locale)} />}
        title={tr(format.name, locale)}
        subtitle={tr(format.description, locale)}
        image={slug === "cap-de-setmana" ? "formatWeekend" : "formatStage"}
        aside={
          <div className="rounded-brand bg-ink/70 p-6 ring-1 ring-paper/10 backdrop-blur">
            <p className="flex items-end gap-3">
              <span className="text-giant font-display font-black italic text-lime">
                {format.maxHours}h
              </span>
            </p>
            <p className="eyebrow text-paper/60">{t("format.maxHoursLabel")}</p>
            <DayCalendar active={format.days} className="mt-6" />
            <ul className="mt-6 space-y-2 text-sm text-paper/80">
              <li className="flex items-center gap-2">
                <Icon name="bed" className="h-4 w-4 text-lime" />{" "}
                {t("common.nights", { count: format.nights })} ·{" "}
                {t("format.nightsLabel")}
              </li>
              <li className="flex items-center gap-2">
                <Icon name="meal" className="h-4 w-4 text-lime" />{" "}
                {t("common.fullBoard")} · {t("format.allInLabel")}
              </li>
            </ul>
          </div>
        }
      >
        <ButtonLink
          href={{ pathname: "/reserva", query: { format: slug } }}
          size="lg"
        >
          {t("nav.cta")}
        </ButtonLink>
      </PageHero>

      {/* Per a qui és */}
      <Section tone="stone" aria-labelledby="forwho-title">
        <div className="container-brand">
          <SectionHeading id="forwho-title" title={t("format.forWho")} />
          <ul className="grid gap-5 md:grid-cols-3">
            {format.forWho.map((item, i) => (
              <Reveal
                as="li"
                key={i}
                delay={i * 0.06}
                className="flex gap-4 rounded-brand bg-paper p-6 sm:p-7"
              >
                <span className="skew-box flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-ink text-lime">
                  <Icon name="check" className="h-5 w-5" />
                </span>
                <p className="text-ink/80">{tr(item, locale)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* Packs del format */}
      <Section aria-labelledby="packs-title">
        <div className="container-brand">
          <SectionHeading id="packs-title" title={t("format.packsTitle")} />
          <PackGrid packs={formatPacks} filter={false} />
        </div>
      </Section>

      {/* Programa tipus */}
      <Section tone="graphite" aria-labelledby="program-title">
        <div className="container-brand">
          <SectionHeading
            id="program-title"
            title={t("format.programTitle")}
            subtitle={`${reference.name} · ${reference.hours}h`}
          />
          <ol
            className={`grid gap-5 ${reference.program.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"}`}
          >
            {reference.program.map((day, i) => (
              <Reveal
                as="li"
                key={day.day}
                delay={i * 0.06}
                className="rounded-brand bg-ink p-6 sm:p-7"
              >
                <p className="eyebrow text-lime">
                  {t(`common.daysLong.${day.day}`)}
                </p>
                <h3 className="mt-3 text-h3 font-black italic">
                  {tr(day.title, locale)}
                </h3>
                <p className="mt-1 font-display text-sm font-bold text-paper/60">
                  {t("pack.dayHours", { count: day.hours })}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-paper/80">
                  {day.items.map((item, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime"
                        aria-hidden="true"
                      />
                      {tr(item, locale)}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Properes dates */}
      <Section aria-labelledby="dates-title">
        <div className="container-brand">
          <SectionHeading id="dates-title" title={t("format.datesTitle")} />
          <DatesList dates={upcoming(dates, slug)} />
        </div>
      </Section>

      {/* FAQ específica */}
      <Section tone="paper" aria-labelledby="faq-title">
        <div className="container-brand grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="faq-title"
              title={t("format.faqTitle")}
              className="!mb-6"
            />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={formatFaqs} light />
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="lime-stripe bg-ink py-24">
        <div className="container-brand flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <h2 className="max-w-3xl text-h2 font-black italic">
              {t("format.ctaTitle")}
            </h2>
            <p className="mt-4 text-paper/70">{t("format.ctaText")}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <ButtonLink
              href={{ pathname: "/reserva", query: { format: slug } }}
              size="lg"
            >
              {t("nav.cta")}
            </ButtonLink>
            <ButtonA
              href={whatsappUrl(t("common.whatsappGeneric"))}
              variant="secondary"
              size="lg"
              icon={null}
              iconStart="whatsapp"
            >
              WhatsApp
            </ButtonA>
          </div>
        </div>
      </section>
    </>
  );
}
