import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.howItWorks" });
  return pageMetadata({
    locale,
    path: "/com-funciona",
    title: t("title"),
    description: t("description"),
  });
}

const ICONS: Record<string, IconName> = {
  "1": "calendar",
  "2": "phone",
  "3": "shield",
  "4": "racket",
};

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("howItWorks");
  const steps = ["1", "2", "3", "4"] as const;

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        image="analysis"
        compact
      >
        <ButtonLink href="/reserva" size="lg">
          {t("cta")}
        </ButtonLink>
      </PageHero>

      <Section tone="stone">
        <div className="container-brand">
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((n, i) => (
              <Reveal
                as="li"
                key={n}
                delay={i * 0.08}
                className="lime-stripe overflow-hidden rounded-brand bg-paper p-7 pb-9"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-6xl font-black italic leading-none">
                    0{n}
                  </span>
                  <span className="skew-box flex h-12 w-12 items-center justify-center rounded-[4px] bg-ink text-lime">
                    <Icon name={ICONS[n]!} className="h-6 w-6" />
                  </span>
                </div>
                <h2 className="mt-8 text-h3 font-black italic">
                  {t(`steps.${n}.title`)}
                </h2>
                <p className="mt-3 text-ink/70">{t(`steps.${n}.text`)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section aria-labelledby="cancel-title">
        <div className="container-brand grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              id="cancel-title"
              title={t("cancellationTitle")}
              subtitle={t("cancellationNote")}
            />
          </div>
          <ul className="space-y-3 lg:col-span-7">
            {(["1", "2", "3", "4"] as const).map((n) => (
              <Reveal
                as="li"
                key={n}
                className="flex gap-4 rounded-brand bg-graphite p-5 sm:p-6"
              >
                <Icon
                  name="check"
                  className="mt-0.5 h-5 w-5 shrink-0 text-lime"
                />
                <p className="text-paper/85">{t(`cancellation.${n}`)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
