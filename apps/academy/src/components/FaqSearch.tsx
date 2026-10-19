"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface FaqItemData {
  category: string;
  q: string;
  a: string;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** FAQ completa amb cerca i filtre per categoria */
export function FaqSearch({
  items,
  categories,
  labels,
}: {
  items: FaqItemData[];
  categories: { id: string; label: string }[];
  labels: {
    search: string;
    searchLabel: string;
    noResults: string;
    all: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter(
      (f) =>
        (category === "all" || f.category === category) &&
        (!q || normalize(`${f.q} ${f.a}`).includes(q)),
    );
  }, [items, query, category]);

  const visibleCategories = categories.filter((c) =>
    filtered.some((f) => f.category === c.id),
  );

  return (
    <div>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/65"
        />
        <label htmlFor="faq-search" className="sr-only">
          {labels.searchLabel}
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          className="h-14 w-full rounded-brand border-2 border-ink/15 bg-paper pl-12 pr-4 text-base text-ink placeholder:text-ink/60 focus:border-ink focus:outline-none"
        />
      </div>

      <div
        role="group"
        className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {[{ id: "all", label: labels.all }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "skew-box h-10 shrink-0 rounded-[3px] px-4 font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] transition-colors",
              category === c.id
                ? "bg-ink text-lime"
                : "border border-ink/25 text-ink/70 hover:border-ink hover:text-ink",
            )}
          >
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-12" aria-live="polite">
        {filtered.length === 0 && (
          <p className="rounded-brand bg-paper p-6 text-ink/70">
            {labels.noResults}
          </p>
        )}
        {visibleCategories.map((c) => (
          <div key={c.id}>
            <h2 className="eyebrow mb-2 text-ink/60">{c.label}</h2>
            <div className="border-t border-ink/15">
              {filtered
                .filter((f) => f.category === c.id)
                .map((f) => (
                  <details
                    key={f.q}
                    className="group border-b border-ink/15 py-1 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 py-5">
                      <span className="flex-1 font-display text-base font-bold sm:text-lg">
                        {f.q}
                      </span>
                      <span
                        className="skew-box flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-ink text-paper transition-colors group-open:bg-lime group-open:text-ink"
                        aria-hidden="true"
                      >
                        <Icon
                          name="plus"
                          className="h-4 w-4 transition-transform duration-300 group-open:rotate-45"
                        />
                      </span>
                    </summary>
                    <p className="pb-6 pr-12 leading-relaxed text-ink/75">
                      {f.a}
                    </p>
                  </details>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
