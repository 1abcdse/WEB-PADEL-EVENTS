import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatList, packs, packsByFormat } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { tr } from "@/lib/i18n-content";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FormatBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DayCalendar } from "@/components/packs/DayCalendar";
import { PackGrid } from "@/components/packs/PackGrid";
import { FinalCta } from "@/components/home/Sections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.experiences" });
  return pageMetadata({
    locale,
    path: "/experiencies",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ExperiencesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("experiences");
  const tc = await getTranslations("common");

  const ideal = {
    "cap-de-setmana": t("idealWeekend"),
    "stage-4-dies": t("idealStage"),
  };

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        image="formatStage"
        compact
      />

      {/* Comparativa visual dels dos formats */}
      <Section aria-labelledby="compare-title">
        <div className="container-brand">
          <SectionHeading id="compare-title" title={t("compareTitle")} />
          <Reveal className="overflow-hidden rounded-brand bg-graphite">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">{t("compareTitle")}</caption>
              <thead>
                <tr>
                  <th scope="col" className="hidden w-1/4 p-6 md:table-cell">
                    <span className="sr-only">—</span>
                  </th>
                  {formatList.map((f, i) => (
                    <th
                      key={f.slug}
                      scope="col"
                      className={`border-paper/10 p-4 align-bottom sm:p-6 ${i === 0 ? "md:border-l" : "border-l"}`}
                    >
                      <FormatBadge
                        format={f.slug}
                        label={tr(f.badge, locale)}
                      />
                      <Link
                        href={`/experiencies/${f.slug}`}
                        className="mt-4 block font-display text-xl font-black uppercase italic hover:text-lime sm:text-3xl"
                      >
                        {tr(f.name, locale)}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm sm:text-base">
                <Row label={t("rows.maxHours")}>
                  {formatList.map((f) => (
                    <span
                      key={f.slug}
                      className="font-display text-5xl font-black italic text-lime sm:text-7xl"
                    >
                      {f.maxHours}h
                    </span>
                  ))}
                </Row>
                <Row label={t("rows.days")}>
                  {formatList.map((f) => (
                    <DayCalendar key={f.slug} active={f.days} />
                  ))}
                </Row>
                <Row label={t("rows.nights")}>
                  {formatList.map((f) => (
                    <span key={f.slug}>
                      {tc("nights", { count: f.nights })}
                    </span>
                  ))}
                </Row>
                <Row label={t("rows.meals")}>
                  {formatList.map((f) => (
                    <span key={f.slug}>{t("meals")}</span>
                  ))}
                </Row>
                <Row label={t("rows.packs")}>
                  {formatList.map((f) => (
                    <ul key={f.slug} className="space-y-1">
                      {packsByFormat(f.slug).map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/experiencies/${p.format}/${p.slug}`}
                            className="hover:text-lime"
                          >
                            {p.name} ·{" "}
                            <span className="text-lime">{p.hours}h</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </Row>
                <Row label={t("rows.ideal")}>
                  {formatList.map((f) => (
                    <span key={f.slug} className="text-paper/80">
                      {ideal[f.slug]}
                    </span>
                  ))}
                </Row>
                <tr className="border-t border-paper/10">
                  <td className="hidden md:table-cell" />
                  {formatList.map((f, i) => (
                    <td
                      key={f.slug}
                      className={`border-paper/10 p-4 sm:p-6 ${i === 0 ? "md:border-l" : "border-l"}`}
                    >
                      <ButtonLink
                        href={`/experiencies/${f.slug}`}
                        size="sm"
                        icon={null}
                        className="!px-3 sm:!px-4"
                        variant={
                          f.slug === "stage-4-dies" ? "primary" : "secondary"
                        }
                      >
                        {tc("viewFormat")}
                      </ButtonLink>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Reveal>
        </div>
      </Section>

      <Section tone="graphite" aria-labelledby="all-packs-title">
        <div className="container-brand">
          <SectionHeading id="all-packs-title" title={t("allPacksTitle")} />
          <div className="[&_article]:bg-ink">
            <PackGrid packs={packs} />
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}

/** Fila de la comparativa: a mòbil l'etiqueta va a sobre (fila pròpia) */
function Row({ label, children }: { label: string; children: ReactNode[] }) {
  return (
    <>
      <tr className="border-t border-paper/10 md:hidden">
        <th
          scope="colgroup"
          colSpan={2}
          className="eyebrow px-4 pb-0 pt-5 text-paper/50 sm:px-6"
        >
          {label}
        </th>
      </tr>
      <tr className="md:border-t md:border-paper/10">
        <th
          scope="row"
          className="eyebrow hidden p-6 align-top text-paper/50 md:table-cell"
        >
          {label}
        </th>
        {children.map((child, i) => (
          <td
            key={i}
            className={`border-paper/10 p-4 align-top sm:p-6 ${i === 0 ? "md:border-l" : "border-l"}`}
          >
            {child}
          </td>
        ))}
      </tr>
    </>
  );
}
