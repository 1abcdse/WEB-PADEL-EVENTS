"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FORMATS, PACKS } from "@/content/packs";
import type { FormatId } from "@/lib/types";
import { PackCard } from "@/components/cards/PackCard";

type Filter = "all" | FormatId;

/** Graella de packs amb filtre per format (Tots / Cap de setmana / Stage 4 dies). */
export function PacksExplorer({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const t = useTranslations("home.packs");
  const tf = useTranslations("formats");
  const [filter, setFilter] = useState<Filter>("all");

  const base = featuredOnly ? PACKS.filter((p) => p.featured) : PACKS;
  // Amb un format triat es mostren tots els packs d'aquest format
  const shown = filter === "all" ? base : PACKS.filter((p) => p.format === filter);

  const options: { id: Filter; label: string }[] = [
    { id: "all", label: t("all") },
    ...(Object.keys(FORMATS) as FormatId[]).map((f) => ({ id: f, label: tf(`${f}.badge`) })),
  ];

  return (
    <div>
      <div role="group" aria-label={t("filterLabel")} className="mb-8 flex flex-wrap gap-3">
        {options.map((o) => {
          const active = o.id === filter;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(o.id)}
              className={`ps-skew min-h-11 rounded-[3px] px-5 transition-colors ${
                active ? "bg-lime text-ink" : "border border-paper/30 text-paper hover:border-paper"
              }`}
            >
              <span className="ps-unskew ps-eyebrow">{o.label}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <PackCard key={`${p.format}-${p.slug}`} pack={p} />
        ))}
      </div>
    </div>
  );
}
