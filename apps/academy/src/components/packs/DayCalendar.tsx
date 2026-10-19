import { useTranslations } from "next-intl";
import type { Weekday } from "@/content/types";
import { cn } from "@/lib/cn";

const ALL: Weekday[] = ["dv", "ds", "dg", "dl"];

/** Calendari visual Dv Ds Dg Dl amb els dies actius ressaltats */
export function DayCalendar({
  active,
  className,
}: {
  active: Weekday[];
  className?: string;
}) {
  const t = useTranslations("common");
  return (
    <ul
      className={cn("flex gap-1.5", className)}
      aria-label={active.map((d) => t(`daysLong.${d}`)).join(", ")}
    >
      {ALL.map((day) => {
        const on = active.includes(day);
        return (
          <li
            key={day}
            aria-hidden="true"
            className={cn(
              "skew-box flex h-10 w-11 items-center justify-center rounded-[3px] font-display text-xs font-bold uppercase sm:h-11 sm:w-12",
              on ? "bg-lime text-ink" : "border border-paper/20 text-paper/55",
            )}
          >
            <span>{t(`days.${day}`)}</span>
          </li>
        );
      })}
    </ul>
  );
}
