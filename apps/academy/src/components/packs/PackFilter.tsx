"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PackFilter({
  label,
  options,
  children,
}: {
  label: string;
  options: { value: string; label: string }[];
  children: ReactNode;
}) {
  const [filter, setFilter] = useState("all");
  return (
    <div data-filter={filter} className="group/packs">
      <div
        role="group"
        aria-label={label}
        className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        {options.map((o) => {
          const active = filter === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(o.value)}
              className={cn(
                "skew-box h-10 shrink-0 rounded-[3px] px-5 font-display text-xs font-bold uppercase tracking-[0.16em] transition-colors",
                active
                  ? "bg-lime text-ink"
                  : "border border-paper/25 text-paper/70 hover:border-paper/60 hover:text-paper",
              )}
            >
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
