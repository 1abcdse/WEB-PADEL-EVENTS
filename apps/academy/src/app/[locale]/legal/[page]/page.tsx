import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { legal, legalUpdated, type LegalPage } from "@/content/legal";
import { routing } from "@/i18n/routing";
import { tr } from "@/lib/i18n-content";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";

type Props = { params: Promise<{ locale: string; page: string }> };

const TITLE_KEY: Record<LegalPage, "legalNotice" | "privacy" | "cookies"> = {
  "avis-legal": "legalNotice",
  privacitat: "privacy",
  cookies: "cookies",
};

const isLegalPage = (p: string): p is LegalPage => p in legal;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(legal).map((page) => ({ locale, page })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, page } = await params;
  if (!isLegalPage(page)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...(await pageMetadata({
      locale,
      path: `/legal/${page}`,
      title: t(`${TITLE_KEY[page]}.title`),
    })),
    robots: { index: false },
  };
}

export default async function LegalPageView({ params }: Props) {
  const { locale, page } = await params;
  if (!isLegalPage(page)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(legalUpdated),
  );

  return (
    <>
      <PageHero
        title={t(`meta.${TITLE_KEY[page]}.title`)}
        subtitle={t("legal.updated", { date: updated })}
        compact
      />
      <div className="on-light bg-paper py-16 text-ink sm:py-24">
        <article className="container-brand max-w-3xl">
          <p className="mb-10 rounded-brand bg-stone p-4 text-sm">
            {t("legal.draft")}
          </p>
          {legal[page].map((section, i) => (
            <section key={i} className="mb-10">
              <h2 className="text-h3 font-black italic">
                {tr(section.title, locale)}
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">
                {tr(section.body, locale)}
              </p>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
