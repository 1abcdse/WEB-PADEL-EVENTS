import { getTranslations, setRequestLocale } from "next-intl/server";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { whatsappUrl } from "@/lib/whatsapp";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Icon, type IconName } from "@/components/ui/Icon";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return pageMetadata({
    locale,
    path: "/contacte",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const channels: {
    icon: IconName;
    label: string;
    value: string;
    href: string;
    highlight?: boolean;
  }[] = [
    {
      icon: "whatsapp",
      label: t("contact.whatsapp"),
      value: t("contact.whatsappText"),
      href: whatsappUrl(t("common.whatsappGeneric")),
      highlight: true,
    },
    {
      icon: "mail",
      label: t("contact.email"),
      value: site.email,
      href: `mailto:${site.email}`,
    },
    {
      icon: "phone",
      label: t("contact.phone"),
      value: site.phone,
      href: `tel:${site.phone.replace(/\s/g, "")}`,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={t("contact.eyebrow")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        compact
      />

      <div className="on-light bg-stone py-16 text-ink sm:py-24">
        <div className="container-brand grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-5">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`group flex items-center gap-5 rounded-brand p-6 transition-transform hover:-translate-y-0.5 ${c.highlight ? "bg-ink text-paper" : "bg-paper"}`}
              >
                <span
                  className={`skew-box flex h-14 w-14 shrink-0 items-center justify-center rounded-[4px] ${c.highlight ? "bg-[#25D366] text-ink" : "bg-ink text-lime"}`}
                >
                  <Icon name={c.icon} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block opacity-60">{c.label}</span>
                  <span className="mt-1 block font-display [overflow-wrap:anywhere] text-lg font-extrabold">
                    {c.value}
                  </span>
                </span>
                <Icon
                  name="arrow"
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                />
              </a>
            ))}
            <div className="rounded-brand bg-paper p-6">
              <p className="eyebrow opacity-60">{t("contact.address")}</p>
              <p className="mt-2 font-semibold">
                {site.address.street}, {site.address.postalCode}{" "}
                {site.address.city}
              </p>
              <MapEmbed
                label={t("contact.address")}
                openLabel={t("facilities.openMap")}
                className="mt-4 aspect-[16/10]"
              />
            </div>
          </div>

          <div className="min-w-0 rounded-brand bg-paper p-6 sm:p-10 lg:col-span-7">
            <h2 className="mb-8 text-h3 font-black italic">
              {t("contact.formTitle")}
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
