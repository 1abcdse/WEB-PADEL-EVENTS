import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";
import { site } from "@/content/site";
import { PageHero } from "@/components/layout/PageHero";
import { BookingWizard } from "@/components/forms/BookingWizard";
import { Icon } from "@/components/ui/Icon";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.booking" });
  return pageMetadata({
    locale,
    path: "/reserva",
    title: t("title"),
    description: t("description"),
  });
}

export default async function BookingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <PageHero
        eyebrow={t("booking.eyebrow")}
        title={t("booking.title")}
        subtitle={t("booking.subtitle")}
        compact
      />
      <div className="on-light bg-paper py-12 text-ink sm:py-20">
        <div className="container-brand grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* El fallback reserva l'alçada del configurador per evitar salts de maquetació (CLS) */}
            <Suspense
              fallback={
                <div
                  className="min-h-[1040px] rounded-brand bg-stone sm:min-h-[760px]"
                  aria-hidden="true"
                />
              }
            >
              <BookingWizard />
            </Suspense>
          </div>
          <aside className="space-y-5 lg:col-span-4">
            <div className="rounded-brand bg-ink p-6 text-paper sm:p-7">
              <p className="eyebrow text-lime">{t("howItWorks.eyebrow")}</p>
              <ol className="mt-5 space-y-5">
                {(["1", "2", "3", "4"] as const).map((n) => (
                  <li key={n} className="flex gap-4">
                    <span className="font-display text-2xl font-black italic text-lime">
                      0{n}
                    </span>
                    <span>
                      <span className="block font-display font-extrabold uppercase">
                        {t(`howItWorks.steps.${n}.title`)}
                      </span>
                      <span className="mt-1 block text-sm text-paper/70">
                        {t(`howItWorks.steps.${n}.text`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-brand bg-stone p-6 sm:p-7">
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={whatsappUrl(t("common.whatsappGeneric"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-semibold hover:underline"
                  >
                    <Icon name="whatsapp" className="h-5 w-5" />{" "}
                    {t("nav.whatsapp")}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Icon name="mail" className="h-5 w-5" /> {site.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <Icon name="phone" className="h-5 w-5" /> {site.phone}
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
