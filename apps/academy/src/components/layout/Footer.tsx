import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/content/site";
import { EXPERIENCE_LINKS, NAV_LINKS } from "@/content/nav";
import { Logo } from "@/components/brand/Logo";
import { LimeBar } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tf = useTranslations("formats");
  const year = new Date().getFullYear();

  const heading = "ps-eyebrow mb-4 text-paper/60";
  const link = "text-paper/85 hover:text-lime";

  return (
    <footer className="bg-ink text-paper">
      <LimeBar />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-32 pt-16 sm:px-8 md:grid-cols-2 md:pb-16 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo tone="dark" className="w-56" />
          <p className="max-w-xs text-paper/75">{t("tagline")}</p>
          <p className="ps-eyebrow text-paper/60">
            {site.location.region} · {site.location.area}
          </p>
        </div>

        <div>
          <h2 className={heading}>{t("contact")}</h2>
          <ul className="space-y-3">
            <li>
              <a href={`mailto:${site.email}`} className={`${link} break-all`}>
                {site.email}
              </a>
            </li>
            {site.whatsapp.display.map((num, i) => (
              <li key={num}>
                <a
                  href={`https://wa.me/${i === 0 ? site.whatsapp.primary : site.whatsapp.secondary}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link} inline-flex items-center gap-2`}
                >
                  <Icon name="whatsapp" size={18} className="text-lime" />
                  {num}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid aspect-[16/9] max-w-full place-items-center rounded-brand border border-dashed border-paper/20 p-4 text-center text-sm text-paper/55">
            {t("mapSoon")}
          </div>
        </div>

        <div>
          <h2 className={heading}>{t("explore")}</h2>
          <ul className="space-y-3">
            {EXPERIENCE_LINKS.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className={link}>
                  {tf(`${e.format}.name`)}
                </Link>
              </li>
            ))}
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {tn(l.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contacte" className={link}>
                {tn("contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className={heading}>{t("legal")}</h2>
            <ul className="space-y-3">
              <li><Link href="/legal/avis-legal" className={link}>{t("legalNotice")}</Link></li>
              <li><Link href="/legal/privacitat" className={link}>{t("privacy")}</Link></li>
              <li><Link href="/legal/cookies" className={link}>{t("cookies")}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className={heading}>{tn("language")}</h2>
            <LanguageSwitcher className="-ml-2" />
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-sm text-paper/55 sm:px-8">
          © {year} {site.name}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
