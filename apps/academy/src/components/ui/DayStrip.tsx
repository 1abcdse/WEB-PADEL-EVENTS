import { useTranslations } from "next-intl";
import type { DayKey } from "@/lib/types";

const ALL_DAYS: DayKey[] = ["fri", "sat", "sun", "mon"];

/** Calendari visual Dv · Ds · Dg · Dl amb els dies del format ressaltats. */
export function DayStrip({
  active,
  surface = "dark",
  className = "",
}: {
  active: DayKey[];
  surface?: "dark" | "light";
  className?: string;
}) {
  const t = useTranslations("days");
  const off = surface === "dark" ? "border border-paper/25 text-paper/45" : "border border-ink/20 text-mute-strong";
  return (
    <ul className={`flex gap-2 ${className}`} aria-label={active.map((d) => t(d)).join(" · ")}>
      {ALL_DAYS.map((d) => {
        const on = active.includes(d);
        return (
          <li
            key={d}
            aria-hidden="true"
            className={`ps-skew grid h-11 w-12 place-items-center rounded-[3px] font-display text-sm font-extrabold uppercase ${
              on ? "bg-lime text-ink" : off
            }`}
          >
            <span className="ps-unskew">{t(d)}</span>
          </li>
        );
      })}
    </ul>
  );
}
