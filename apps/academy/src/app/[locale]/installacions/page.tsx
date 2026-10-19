import { getTranslations, setRequestLocale } from "next-intl/server";
import { site } from "@/content/site";
import type { ImageKey } from "@/content/images";
import { pageMetadata } from "@/lib/seo";
import { locationSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Gallery } from "@/components/home/Sections";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.facilities" });
  return pageMetadata({
    locale,
    path: "/installacions",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FacilitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("facilities");
  const tm = await getTranslations("meta");

  const blocks: {
    key: "courts" | "rooms" | "food";
    image: ImageKey;
    icon: IconName;
  }[] = [
    { key: "courts", image: "courts", icon: "racket" },
    { key: "rooms", image: "rooms", icon: "bed" },
    { key: "food", image: "food", icon: "meal" },
  ];
  const travel: { key: "car" | "train" | "plane"; icon: IconName }[] = [
    { key: "car", icon: "car" },
    { key: "train", icon: "train" },
    { key: "plane", icon: "plane" },
  ];

  return (
    <>
      <JsonLd data={locationSchema(locale, tm("description"))} />
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        image="courts"
        compact
      />

      <Section tone="paper">
        <div className="container-brand space-y-20 sm:space-y-28">
          {blocks.map((b, i) => (
            <Reveal
              key={b.key}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <Photo
                image={b.image}
                className={cn(
                  "aspect-[4/3] rounded-brand",
                  i % 2 === 1 && "lg:order-2",
                )}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div>
                <span className="skew-box inline-flex h-14 w-14 items-center justify-center rounded-[4px] bg-ink text-lime">
                  <Icon name={b.icon} className="h-7 w-7" />
                </span>
                <h2 className="mt-6 text-h2 font-black italic">
                  {t(`${b.key}Title`)}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink/75">
                  {t(`${b.key}Text`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section aria-labelledby="location-title">
        <div className="container-brand">
          <SectionHeading
            id="location-title"
            title={t("locationTitle")}
            subtitle={`${site.address.street} · ${site.address.postalCode} ${site.address.city}`}
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <MapEmbed
              label={t("locationTitle")}
              openLabel={t("openMap")}
              className="min-h-[360px] lg:col-span-2"
            />
            <ul className="space-y-3">
              {travel.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-4 rounded-brand bg-graphite p-5"
                >
                  <Icon
                    name={item.icon}
                    className="h-6 w-6 shrink-0 text-lime"
                  />
                  <div>
                    <p className="font-display font-extrabold uppercase">
                      {t(item.key)}
                    </p>
                    <p className="mt-1 text-sm text-paper/70">
                      {t(`${item.key}Text`, { airport: site.airport })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="graphite">
        <div className="container-brand">
          <Gallery />
        </div>
      </Section>
    </>
  );
}
