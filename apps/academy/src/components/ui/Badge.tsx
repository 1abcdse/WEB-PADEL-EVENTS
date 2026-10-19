import type { ReactNode } from "react";
import type { FormatSlug } from "@/content/types";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Paral·lelogram petit. `tone` permet variants fora dels formats. */
export function Tag({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: "ink" | "lime" | "paper" | "outline";
  className?: string;
}) {
  const tones = {
    ink: "bg-ink text-lime",
    lime: "bg-lime text-ink",
    paper: "bg-paper text-ink",
    outline: "border border-current",
  };
  return (
    <span
      className={cn(
        "skew-box inline-flex items-center rounded-[3px] px-2.5 py-1",
        tones[tone],
        className,
      )}
    >
      <span className="eyebrow inline-flex items-center gap-1.5 !text-[0.65rem] !tracking-[0.2em]">
        {children}
      </span>
    </span>
  );
}

/**
 * Badge de format. Cada format té color i icona propis perquè no es confonguin mai:
 *  - Cap de setmana: negre amb text llima + icona calendari
 *  - Stage 4 dies:   llima amb text negre + icona llamp
 */
export function FormatBadge({
  format,
  label,
  className,
  onDark = true,
}: {
  format: FormatSlug;
  label: string;
  className?: string;
  onDark?: boolean;
}) {
  const weekend = format === "cap-de-setmana";
  return (
    <Tag
      tone={weekend ? "ink" : "lime"}
      className={cn(weekend && onDark && "ring-1 ring-lime/40", className)}
    >
      <Icon name={weekend ? "calendar" : "bolt"} className="h-3.5 w-3.5" />
      {label}
    </Tag>
  );
}
