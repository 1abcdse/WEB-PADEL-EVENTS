import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formats } from "@/content/formats";
import type { Pack } from "@/content/types";
import { formatPrice, tr } from "@/lib/i18n-content";
import { FormatBadge, Tag } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function packHref(pack: Pack) {
  return `/experiencies/${pack.format}/${pack.slug}`;
}

/** Targeta de pack: fons graphite, xifra d'hores gegant en llima, inclosos, preu "des de" i CTA */
export function PackCard({
  pack,
  className,
  headingLevel = "h3",
}: {
  pack: Pack;
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const format = formats[pack.format];
  const Heading = headingLevel;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-brand bg-graphite p-6 text-paper ring-1 ring-paper/5 transition-[transform,box-shadow] duration-300 ease-brand hover:-translate-y-1 hover:ring-lime/40 sm:p-7",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <FormatBadge format={pack.format} label={tr(format.badge, locale)} />
        {pack.featured && <Tag tone="paper">{t("featured")}</Tag>}
      </div>

      <p className="mt-8 flex items-end gap-2 font-display font-black italic leading-none text-lime">
        <span className="text-[5.5rem] tracking-tighter sm:text-[6.5rem]">
          {pack.hours}
        </span>
        <span className="mb-3 text-2xl">h</span>
      </p>
      <p className="eyebrow mt-1 text-paper/50">{t("hoursOfPadel")}</p>

      <Heading className="mt-6 text-h3 font-black italic">
        <Link
          href={packHref(pack)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {pack.name}
        </Link>
      </Heading>
      <p className="mt-2 text-sm text-paper/70">{tr(pack.tagline, locale)}</p>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-paper/10 pt-5 text-[0.8rem] text-paper/80">
        <li className="flex items-center gap-2">
          <Icon name="bed" className="h-4 w-4 text-lime" />
          {t("nights", { count: pack.nights })}
        </li>
        <li className="flex items-center gap-2">
          <Icon name="meal" className="h-4 w-4 text-lime" />
          {t("fullBoard")}
        </li>
        <li className="flex items-center gap-2">
          <Icon name="users" className="h-4 w-4 text-lime" />
          {t("groupMax", { count: pack.groupSize })}
        </li>
        <li className="col-span-2 flex items-center gap-2">
          <Icon name="target" className="h-4 w-4 text-lime" />
          {pack.levels.map((l) => t(`levels.${l}`)).join(" · ")}
        </li>
      </ul>

      <div className="mt-auto flex items-end justify-between gap-4 pt-7">
        <p>
          <span className="block text-xs text-paper/50">{t("from")}</span>
          <span className="font-display text-2xl font-extrabold">
            {formatPrice(pack.priceFrom, locale)}
          </span>
          <span className="ml-1 text-xs text-paper/50">/ {t("perPerson")}</span>
        </p>
        <span
          aria-hidden="true"
          className="skew-box flex h-11 w-11 items-center justify-center rounded-[3px] bg-lime text-ink transition-transform duration-300 ease-brand group-hover:translate-x-1"
        >
          <Icon name="arrow" className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}
