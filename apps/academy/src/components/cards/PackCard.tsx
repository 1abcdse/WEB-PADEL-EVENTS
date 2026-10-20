import { useLocale, useTranslations } from "next-intl";
import { FORMATS } from "@/content/packs";
import { formatPrice } from "@/lib/packs";
import { pick, type Pack } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FormatBadge, LimeBar } from "@/components/ui/Brand";
import { Icon, type IconName } from "@/components/ui/Icon";

/** Targeta de pack: fons graphite, hores gegants en llima, inclosos i preu "des de". */
export function PackCard({ pack }: { pack: Pack }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const tl = useTranslations("levels");
  const format = FORMATS[pack.format];

  const rows: { icon: IconName; text: string }[] = [
    { icon: "moon", text: t("nights", { count: pack.nights }) },
    { icon: "meal", text: pick(pack.meals, locale) },
    { icon: "users", text: t("spotsPerGroup", { count: pack.maxPlayersPerGroup }) },
    { icon: "chart", text: `${t("level")}: ${pack.levels.map((l) => tl(l)).join(" · ")}` },
  ];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-brand bg-graphite text-paper">
      <div className="flex flex-1 flex-col gap-6 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <FormatBadge format={pack.format} />
          {pack.featured && <span className="ps-eyebrow text-lime">★</span>}
        </div>

        <div>
          <p className="font-display text-giant font-black italic text-lime">
            {pack.hours}
            <span className="text-[0.45em] align-top">h</span>
          </p>
          <p className="ps-eyebrow mt-2 text-paper/70">{t("hoursOfPadel")}</p>
        </div>

        <div>
          <h3 className="font-display text-title font-black uppercase italic">{pack.name}</h3>
          <p className="mt-2 text-paper/80">{pick(pack.tagline, locale)}</p>
        </div>

        <ul className="space-y-3 text-sm text-paper/85">
          {rows.map((r) => (
            <li key={r.icon} className="flex gap-3">
              <Icon name={r.icon} size={18} className="mt-0.5 shrink-0 text-lime" />
              <span>{r.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-paper/15 pt-5">
          <p>
            <span className="ps-eyebrow block text-paper/60">{t("from")}</span>
            <span className="font-display text-3xl font-black italic">{formatPrice(pack.priceFrom, locale)}</span>
            <span className="ml-1 text-sm text-paper/60">{t("perPerson")}</span>
          </p>
          <Button href={`/experiencies/${format.slug}/${pack.slug}`}>{t("viewPack")}</Button>
        </div>
      </div>
      <LimeBar />
    </article>
  );
}
