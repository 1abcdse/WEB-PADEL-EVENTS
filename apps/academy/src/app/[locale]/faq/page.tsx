import { getTranslations, setRequestLocale } from "next-intl/server";
import { faqCategories, faqs } from "@/content/faq";
import { tr } from "@/lib/i18n-content";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/components/FaqList";
import { FaqSearch } from "@/components/FaqSearch";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonA } from "@/components/ui/Button";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.faq" });
  return pageMetadata({
    locale,
    path: "/faq",
    title: t("title"),
    description: t("description"),
  });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const tc = await getTranslations("common");

  return (
    <>
      <JsonLd data={faqJsonLd(faqs, locale)} />
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        compact
      >
        <ButtonA
          href={whatsappUrl(tc("whatsappGeneric"))}
          variant="secondary"
          icon={null}
          iconStart="whatsapp"
        >
          WhatsApp
        </ButtonA>
      </PageHero>
      <div className="on-light bg-stone py-16 text-ink sm:py-24">
        <div className="container-brand max-w-4xl">
          <FaqSearch
            items={faqs.map((f) => ({
              category: f.category,
              q: tr(f.q, locale),
              a: tr(f.a, locale),
            }))}
            categories={Object.entries(faqCategories).map(([id, label]) => ({
              id,
              label: tr(label, locale),
            }))}
            labels={{
              search: t("search"),
              searchLabel: t("searchLabel"),
              noResults: t("noResults"),
              all: t("all"),
            }}
          />
        </div>
      </div>
    </>
  );
}
