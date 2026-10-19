import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { MethodSteps, TeamGrid, FinalCta } from "@/components/home/Sections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.academy" });
  return pageMetadata({
    locale,
    path: "/academia",
    title: t("title"),
    description: t("description"),
  });
}

export default async function AcademyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("academy");
  const tm = await getTranslations("home.method");

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        image="academy"
        compact
      />

      <Section tone="paper" aria-labelledby="history-title">
        <div className="container-brand grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 id="history-title" className="text-h2 font-black italic">
              {t("historyTitle")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink/80">
              {t("history1")}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink/80">
              {t("history2")}
            </p>
          </Reveal>
          <Reveal className="relative">
            <Photo
              image="academy"
              className="aspect-[4/5] rounded-brand"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <span className="skew-box absolute -bottom-5 left-6 rounded-[4px] bg-lime px-5 py-3 text-ink">
              <span className="font-display text-2xl font-black italic">
                PADEL SYSTEM
              </span>
            </span>
          </Reveal>
        </div>
      </Section>

      <Section tone="graphite" stripe aria-labelledby="method-title">
        <div className="container-brand">
          <SectionHeading
            id="method-title"
            eyebrow={t("methodTitle")}
            title={tm("title")}
            subtitle={tm("subtitle")}
          />
          <div className="[&_li]:bg-ink">
            <MethodSteps />
          </div>
        </div>
      </Section>

      <Section aria-labelledby="team-title">
        <div className="container-brand">
          <SectionHeading id="team-title" title={t("teamTitle")} />
          <TeamGrid />
        </div>
      </Section>

      <Section tone="lime" aria-labelledby="values-title">
        <div className="container-brand">
          <SectionHeading id="values-title" title={t("valuesTitle")} />
          <ul className="grid gap-px overflow-hidden rounded-brand bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            {(["1", "2", "3", "4"] as const).map((n, i) => (
              <Reveal as="li" key={n} delay={i * 0.06} className="bg-lime p-7">
                <span className="font-display text-sm font-bold">0{n}</span>
                <h3 className="mt-4 text-h3 font-black italic">
                  {t(`values.${n}.title`)}
                </h3>
                <p className="mt-3 text-ink/75">{t(`values.${n}.text`)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
