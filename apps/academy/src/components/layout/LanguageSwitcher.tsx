"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Selector d'idioma: CA · ES · EN. Manté la pàgina actual. */
export function LanguageSwitcher({ className = "", onChange }: { className?: string; onChange?: () => void }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div role="group" aria-label={t("language")} className={`flex items-center gap-1 ${className}`}>
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              if (active) return;
              router.replace(pathname, { locale: l });
              onChange?.();
            }}
            className={`ps-eyebrow min-h-10 min-w-10 rounded-[3px] px-2 transition-colors ${
              active ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
