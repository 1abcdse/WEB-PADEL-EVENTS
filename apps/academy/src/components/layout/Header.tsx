"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { BOOK_HREF, EXPERIENCE_LINKS, NAV_LINKS } from "@/content/nav";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/Brand";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Header fix: transparent sobre el hero, negre en fer scroll. */
export function Header() {
  const t = useTranslations("nav");
  const tf = useTranslations("formats");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tanca menús en canviar de pàgina
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  // Bloqueja l'scroll de fons amb el menú mòbil obert; Escape tanca
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Tanca el desplegable en clicar fora
  useEffect(() => {
    if (!dropOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropOpen]);

  const solid = scrolled || menuOpen;

  return (
    <>
      <a
        href="#contingut"
        className="ps-eyebrow fixed left-4 top-4 z-[60] -translate-y-24 rounded-[3px] bg-lime px-4 py-3 text-ink focus:translate-y-0"
      >
        {t("skip")}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-paper transition-[background-color,box-shadow] duration-300 ${
          solid ? "bg-ink shadow-[0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-20">
          <Link href="/" aria-label={t("home")} className="shrink-0">
            <Logo tone="dark" className="h-9 w-auto lg:h-11" />
          </Link>

          {/* Navegació d'escriptori */}
          <nav aria-label={t("menu")} className="hidden items-center gap-1 lg:flex">
            <div
              ref={dropRef}
              className="relative"
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
            >
              <button
                type="button"
                aria-expanded={dropOpen}
                aria-controls="menu-experiencies"
                onClick={() => setDropOpen((v) => !v)}
                className="ps-eyebrow inline-flex min-h-11 items-center gap-2 px-3 text-paper/90 hover:text-paper"
              >
                {t("experiences")}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform ${dropOpen ? "rotate-180" : ""}`}>
                  <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
              <div
                id="menu-experiencies"
                hidden={!dropOpen}
                className="absolute left-0 top-full w-80 pt-2"
              >
                <ul className="overflow-hidden rounded-brand bg-graphite p-2 shadow-2xl ring-1 ring-paper/10">
                  {EXPERIENCE_LINKS.map((e) => (
                    <li key={e.href}>
                      <Link href={e.href} className="block rounded-[6px] p-4 hover:bg-ink">
                        <FormatBadge format={e.format} />
                        <span className="mt-3 block font-display text-lg font-black uppercase italic">
                          {tf(`${e.format}.name`)}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/experiencies" className="ps-eyebrow block rounded-[6px] p-4 text-lime hover:bg-ink">
                      {t("allExperiences")} →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="ps-eyebrow inline-flex min-h-11 items-center px-3 text-paper/90 hover:text-paper"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher />
            <Button href={BOOK_HREF}>{t("book")}</Button>
          </div>

          {/* Botó de menú mòbil */}
          <button
            type="button"
            className="grid size-12 place-items-center lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobil"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-4 w-7">
              <span className={`absolute left-0 h-[3px] w-7 bg-paper transition-transform ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-[3px] w-5 bg-lime transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-[3px] w-7 bg-paper transition-transform ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </header>

      {/* Menú mòbil a pantalla completa */}
      <div
        id="menu-mobil"
        hidden={!menuOpen}
        className="fixed inset-0 z-40 overflow-y-auto bg-ink pt-16 text-paper lg:hidden"
      >
        <nav aria-label={t("menu")} className="flex min-h-full flex-col gap-8 px-5 pb-32 pt-8">
          <div className="space-y-3">
            <p className="ps-eyebrow text-paper/60">{t("experiences")}</p>
            {EXPERIENCE_LINKS.map((e) => (
              <Link key={e.href} href={e.href} className="flex items-center justify-between gap-4 border-b border-paper/10 py-3">
                <span className="font-display text-3xl font-black uppercase italic">{tf(`${e.format}.name`)}</span>
                <FormatBadge format={e.format} className="shrink-0" />
              </Link>
            ))}
            <Link href="/experiencies" className="ps-eyebrow inline-block py-2 text-lime">
              {t("allExperiences")} →
            </Link>
          </div>
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-2 font-display text-3xl font-black uppercase italic">
                  {t(l.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contacte" className="block py-2 font-display text-3xl font-black uppercase italic">
                {t("contact")}
              </Link>
            </li>
          </ul>
          <LanguageSwitcher onChange={() => setMenuOpen(false)} />
        </nav>
      </div>
    </>
  );
}
