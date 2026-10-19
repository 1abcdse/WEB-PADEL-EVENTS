import { getTranslations, setRequestLocale } from "next-intl/server";
import { faqs, formats, packs } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { locationSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import {
  DayTimeline,
  FinalCta,
  Gallery,
  IncludesGrid,
  MethodSteps,
  TeamGrid,
  Testimonials,
} from "@/components/home/Sections";
import { FormatCard } from "@/components/packs/FormatCard";
import { PackGrid } from "@/components/packs/PackGrid";
import { FaqList, faqJsonLd } from "@/components/FaqList";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata({ locale, path: "/" });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tm = await getTranslations("meta");
  const homeFaqs = faqs.filter((f) => f.home).slice(0, 5);

  return (
    <>
      <JsonLd data={locationSchema(locale, tm("description"))} />
      <JsonLd data={faqJsonLd(homeFaqs, locale)} />

      {/* 1. Hero */}
      <Hero />

      {/* 2. Barra de xifres */}
      <StatsBar />

      {/* 3. Tria el teu format */}
      <Section aria-labelledby="formats-title">
        <div className="container-brand">
          <SectionHeading
            id="formats-title"
            eyebrow={t("formats.eyebrow")}
            title={t("formats.title")}
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <FormatCard
              format={formats["cap-de-setmana"]}
              image="formatWeekend"
            />
            <FormatCard format={formats["stage-4-dies"]} image="formatStage" />
          </div>
        </div>
      </Section>

      {/* 4. Què inclou */}
      <Section tone="stone" aria-labelledby="includes-title">
        <div className="container-brand">
          <SectionHeading
            id="includes-title"
            eyebrow={t("includes.eyebrow")}
            title={t("includes.title")}
          />
          <IncludesGrid />
        </div>
      </Section>

      {/* 5. Packs destacats amb filtre */}
      <Section aria-labelledby="packs-title">
        <div className="container-brand">
          <SectionHeading
            id="packs-title"
            eyebrow={t("packs.eyebrow")}
            title={t("packs.title")}
          />
          <PackGrid packs={packs} />
        </div>
      </Section>

      {/* 6. El mètode PS */}
      <Section tone="graphite" stripe aria-labelledby="method-title">
        <div className="container-brand">
          <SectionHeading
            id="method-title"
            eyebrow={t("method.eyebrow")}
            title={t("method.title")}
            subtitle={t("method.subtitle")}
          />
          <div className="[&_li]:bg-ink">
            <MethodSteps />
          </div>
        </div>
      </Section>

      {/* 7. Un dia a l'acadèmia */}
      <Section aria-labelledby="day-title">
        <div className="container-brand">
          <SectionHeading
            id="day-title"
            eyebrow={t("day.eyebrow")}
            title={t("day.title")}
            subtitle={t("day.subtitle")}
          />
          <DayTimeline />
        </div>
      </Section>

      {/* 8. Equip */}
      <Section tone="graphite" aria-labelledby="team-title">
        <div className="container-brand">
          <SectionHeading
            id="team-title"
            eyebrow={t("team.eyebrow")}
            title={t("team.title")}
            action={
              <ButtonLink href="/academia" variant="secondary" size="sm">
                {t("method.eyebrow")}
              </ButtonLink>
            }
          />
          <TeamGrid />
        </div>
      </Section>

      {/* 9. Testimonis */}
      <Section tone="stone" aria-labelledby="testimonials-title">
        <div className="container-brand">
          <SectionHeading
            id="testimonials-title"
            eyebrow={t("testimonials.eyebrow")}
            title={t("testimonials.title")}
          />
          <Testimonials />
        </div>
      </Section>

      {/* 10. Galeria */}
      <Section aria-labelledby="gallery-title">
        <div className="container-brand">
          <SectionHeading
            id="gallery-title"
            eyebrow={t("gallery.eyebrow")}
            title={t("gallery.title")}
          />
          <Gallery />
        </div>
      </Section>

      {/* 11. FAQ resumida */}
      <Section tone="paper" aria-labelledby="faq-title">
        <div className="container-brand grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              id="faq-title"
              eyebrow={t("faq.eyebrow")}
              title={t("faq.title")}
              className="!mb-8"
            />
            <ButtonLink href="/faq" variant="outline-ink" size="sm">
              {t("faq.all")}
            </ButtonLink>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={homeFaqs} light />
          </div>
        </div>
      </Section>

      {/* 12. CTA final */}
      <FinalCta />
    </>
  );
}
