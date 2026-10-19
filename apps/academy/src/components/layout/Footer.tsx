import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatList } from "@/content/formats";
import { site } from "@/content/site";
import { tr } from "@/lib/i18n-content";
import { whatsappUrl } from "@/lib/whatsapp";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { CookieSettingsButton } from "./CookieBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  const explore = [
    { href: "/experiencies", label: t("nav.experiences") },
    ...formatList.map((f) => ({
      href: `/experiencies/${f.slug}`,
      label: tr(f.name, locale),
    })),
    { href: "/reserva", label: t("nav.cta") },
    { href: "/com-funciona", label: t("nav.howItWorks") },
    { href: "/academia", label: t("nav.academy") },
    { href: "/installacions", label: t("nav.facilities") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/contacte", label: t("nav.contact") },
  ];

  const socials = [
    {
      href: site.social.instagram,
      icon: "instagram" as const,
      label: "Instagram",
    },
    { href: site.social.youtube, icon: "youtube" as const, label: "YouTube" },
    { href: site.social.tiktok, icon: "tiktok" as const, label: "TikTok" },
  ];

  return (
    <footer className="lime-stripe border-t border-paper/10 bg-ink pb-28 pt-16 text-paper md:pb-12">
      <div className="container-brand grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/60">
            {t("footer.tagline")}
          </p>
          <p className="eyebrow mt-8 text-paper/50">{t("footer.follow")}</p>
          <ul className="mt-3 flex gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="skew-box flex h-10 w-10 items-center justify-center rounded-[3px] bg-graphite transition-colors hover:bg-lime hover:text-ink"
                >
                  <Icon name={s.icon} className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={t("footer.explore")} className="lg:col-span-2">
          <p className="eyebrow text-paper/50">{t("footer.explore")}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/80 hover:text-lime">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <p className="eyebrow text-paper/50">{t("footer.contact")}</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={whatsappUrl(t("common.whatsappGeneric"))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-lime"
              >
                <Icon name="whatsapp" className="h-4 w-4 text-lime" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-3 hover:text-lime"
              >
                <Icon name="mail" className="h-4 w-4 text-lime" /> {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 hover:text-lime"
              >
                <Icon name="phone" className="h-4 w-4 text-lime" /> {site.phone}
              </a>
            </li>
            <li className="flex items-start gap-3 text-paper/80">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
              <span>
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </span>
            </li>
          </ul>
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="lg:col-span-3">
          <MapEmbed
            label={t("contact.address")}
            openLabel="Google Maps"
            className="aspect-[4/3]"
          />
        </div>
      </div>

      <div className="container-brand mt-14 flex flex-col gap-4 border-t border-paper/10 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {site.name}. {t("footer.rights")}
        </p>
        <nav aria-label={t("footer.legal")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/legal/avis-legal" className="hover:text-lime">
                {t("footer.legalNotice")}
              </Link>
            </li>
            <li>
              <Link href="/legal/privacitat" className="hover:text-lime">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/legal/cookies" className="hover:text-lime">
                {t("footer.cookies")}
              </Link>
            </li>
            <li>
              <CookieSettingsButton label={t("footer.cookieSettings")} />
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
