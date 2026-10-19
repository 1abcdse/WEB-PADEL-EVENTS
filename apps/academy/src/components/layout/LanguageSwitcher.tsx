"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({
  className,
  large = false,
}: {
  className?: string;
  large?: boolean;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn("flex items-center", className)}
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span
              className="mx-1.5 h-3 w-px bg-current opacity-30"
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            onClick={() =>
              router.replace(pathname, { locale: l, scroll: false })
            }
            className={cn(
              "font-display font-semibold uppercase tracking-[0.18em] transition-opacity",
              large ? "text-lg" : "text-[0.7rem]",
              l === locale ? "text-lime" : "opacity-60 hover:opacity-100",
            )}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
