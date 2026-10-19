import { useLocale, useTranslations } from "next-intl";
import { formatList } from "@/content/formats";
import type { Pack } from "@/content/types";
import { tr } from "@/lib/i18n-content";
import { Reveal } from "@/components/ui/Reveal";
import { PackCard } from "./PackCard";
import { PackFilter } from "./PackFilter";

/**
 * Graella de packs amb filtre per format. Les targetes es renderitzen al servidor;
 * el filtre (client) només canvia un data-attribute i el CSS amaga la resta.
 */
export function PackGrid({
  packs,
  filter = true,
}: {
  packs: Pack[];
  filter?: boolean;
}) {
  const t = useTranslations("home.packs");
  const locale = useLocale();
  const grid = (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack, i) => (
        <Reveal
          as="li"
          key={pack.slug}
          delay={(i % 3) * 0.06}
          className={
            pack.format === "cap-de-setmana"
              ? "group-data-[filter=stage-4-dies]/packs:hidden"
              : "group-data-[filter=cap-de-setmana]/packs:hidden"
          }
        >
          <PackCard pack={pack} />
        </Reveal>
      ))}
    </ul>
  );

  if (!filter) return grid;

  return (
    <PackFilter
      label={t("filterLabel")}
      options={[
        { value: "all", label: t("filterAll") },
        ...formatList.map((f) => ({
          value: f.slug,
          label: tr(f.badge, locale),
        })),
      ]}
    >
      {grid}
    </PackFilter>
  );
}
