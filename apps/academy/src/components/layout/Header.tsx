"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { formatList } from "@/content/formats";
import { tr } from "@/lib/i18n-content";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { FormatBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV = [
  { href: "/com-funciona", key: "howItWorks" },
  { href: "/academia", key: "academy" },
  { href: "/installacions", key: "facilities" },
  { href: "/faq", key: "faq" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tanca menús en canviar de pàgina
  useEffect(() => {
    setMenuOpen(false);
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropdown(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!dropdown) return;
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setDropdown(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [dropdown]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300",
          solid
            ? "bg-ink/95 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur"
            : "bg-gradient-to-b from-ink/60 to-transparent",
        )}
      >
        <div className="container-brand flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="relative z-[60] shrink-0">
            <Logo />
          </Link>

          {/* Navegació desktop */}
          <nav
            aria-label="Principal"
            className="hidden items-center gap-7 lg:flex"
          >
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDropdown(true)}
              onMouseLeave={() => setDropdown(false)}
            >
              <button
                type="button"
                aria-expanded={dropdown}
                aria-controls="menu-experiencies"
                // Ratolí: el hover ja l'obre (un clic no l'ha de tancar). Teclat (detail 0): alterna.
                onClick={(e) =>
                  setDropdown((v) => (e.detail === 0 ? !v : true))
                }
                className={cn(
                  "flex items-center gap-1.5 py-6 font-display text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-lime",
                  isActive("/experiencies") && "text-lime",
                )}
              >
                {t("experiences")}
                <Icon
                  name="chevron"
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    dropdown && "rotate-180",
                  )}
                />
              </button>
              {dropdown && (
                <div
                  id="menu-experiencies"
                  className="animate-drop absolute left-1/2 top-full w-[440px] -translate-x-1/2 rounded-brand bg-graphite p-3 shadow-2xl ring-1 ring-paper/10"
                >
                  {formatList.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/experiencies/${f.slug}`}
                      className="flex items-center gap-4 rounded-md p-4 transition-colors hover:bg-ink"
                    >
                      <span className="font-display text-4xl font-black italic text-lime">
                        {f.maxHours}h
                      </span>
                      <span className="flex-1">
                        <FormatBadge
                          format={f.slug}
                          label={tr(f.badge, locale)}
                        />
                        <span className="mt-2 block text-sm text-paper/70">
                          {tr(f.tagline, locale)}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/experiencies"
                    className="mt-1 flex items-center justify-between rounded-md px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-paper/80 hover:bg-ink hover:text-lime"
                  >
                    {t("compare")}
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "font-display text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-lime",
                  isActive(item.href) && "text-lime",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <LanguageSwitcher />
            <ButtonLink href="/reserva" size="sm">
              {t("cta")}
            </ButtonLink>
          </div>

          {/* Botó menú mòbil */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobil"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="relative z-[60] flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <Icon name={menuOpen ? "x" : "menu"} className="h-7 w-7" />
          </button>
        </div>
      </header>

      {/* Menú mòbil a pantalla completa (fora del <header>: el backdrop-blur trencaria el position:fixed) */}
      {menuOpen && (
        <div
          id="menu-mobil"
          className="animate-fade fixed inset-0 z-[48] flex flex-col overflow-y-auto bg-ink px-4 pb-32 pt-[calc(var(--header-h)+24px)] sm:px-6 lg:hidden"
        >
          <nav aria-label={t("menu")} className="flex flex-col">
            <p className="eyebrow mb-3 text-paper/50">{t("experiences")}</p>
            {formatList.map((f) => (
              <Link
                key={f.slug}
                href={`/experiencies/${f.slug}`}
                className="flex items-baseline gap-3 py-2"
              >
                <span className="font-display text-4xl font-black uppercase italic">
                  {tr(f.badge, locale)}
                </span>
                <span className="font-display text-lg font-bold italic text-lime">
                  {f.maxHours}h
                </span>
              </Link>
            ))}
            <Link
              href="/experiencies"
              className="eyebrow mb-6 mt-2 inline-flex items-center gap-2 text-lime"
            >
              {t("compare")} <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <div className="my-2 h-px bg-paper/10" />
            {[...NAV, { href: "/contacte", key: "contact" } as const].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-2 font-display text-3xl font-black uppercase italic text-paper/90 hover:text-lime"
                >
                  {t(item.key)}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-10 flex items-center justify-between">
            <LanguageSwitcher large />
          </div>
        </div>
      )}
    </>
  );
}
