"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const KEY = "ps-cookie-consent";

export function openCookieSettings() {
  window.dispatchEvent(new Event("ps:cookies"));
}

/** Banner RGPD. Només hi ha cookies tècniques, però deixem l'elecció registrada. */
export function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
    const reopen = () => setVisible(true);
    window.addEventListener("ps:cookies", reopen);
    return () => window.removeEventListener("ps:cookies", reopen);
  }, []);

  const choose = (value: "all" | "necessary") => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ value, date: new Date().toISOString() }),
      );
    } catch {
      /* navegació privada: no passa res */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-[88px] z-[45] mx-auto max-w-xl rounded-brand bg-paper p-5 text-ink shadow-2xl md:bottom-6 md:left-6 md:right-auto"
    >
      <p className="text-sm leading-relaxed">
        {t("text")}{" "}
        <Link
          href="/legal/cookies"
          className="font-semibold underline underline-offset-2"
        >
          {t("more")}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => choose("all")}
          className="skew-box h-10 rounded-[3px] bg-ink px-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-paper"
        >
          <span>{t("accept")}</span>
        </button>
        <button
          type="button"
          onClick={() => choose("necessary")}
          className="skew-box h-10 rounded-[3px] border-2 border-ink px-5 font-display text-xs font-bold uppercase tracking-[0.14em]"
        >
          <span>{t("reject")}</span>
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="hover:text-lime"
    >
      {label}
    </button>
  );
}
