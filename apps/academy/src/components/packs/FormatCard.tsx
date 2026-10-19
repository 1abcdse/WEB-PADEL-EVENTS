import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Format } from "@/content/types";
import type { ImageKey } from "@/content/images";
import { tr } from "@/lib/i18n-content";
import { FormatBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { DayCalendar } from "./DayCalendar";

/** Targeta gran de format (split screen a la home) */
export function FormatCard({
  format,
  image,
}: {
  format: Format;
  image: ImageKey;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const href = `/experiencies/${format.slug}`;

  return (
    <article className="group relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden rounded-brand p-6 sm:p-10 lg:min-h-[640px]">
      <Photo
        image={image}
        className="!absolute inset-0 -z-10 transition-transform duration-700 ease-brand group-hover:scale-[1.03]"
        sizes="(min-width: 1024px) 50vw, 100vw"
        overlay={0.55}
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-ink via-ink/80 to-transparent"
        aria-hidden="true"
      />

      <FormatBadge
        format={format.slug}
        label={tr(format.badge, locale)}
        className="self-start"
      />

      <p className="mt-6 flex items-end gap-3 leading-none">
        <span className="text-giant font-display font-black italic text-lime">
          {format.maxHours}h
        </span>
        <span className="eyebrow mb-3 text-paper/70">
          {t("home.formats.max")}
        </span>
      </p>

      <h3 className="mt-4 text-h2 font-black italic">
        <Link href={href} className="after:absolute after:inset-0">
          {tr(format.name, locale)}
        </Link>
      </h3>
      <p className="mt-3 max-w-md text-paper/80">
        {tr(format.tagline, locale)}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
        <DayCalendar active={format.days} />
        <span className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-lime">
          {t("home.formats.cta")}
          <Icon
            name="arrow"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  );
}
