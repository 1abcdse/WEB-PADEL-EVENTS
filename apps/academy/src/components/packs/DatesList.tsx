import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formats } from "@/content/formats";
import type { SessionDate } from "@/content/types";
import { formatDateRange, isBookable, tr } from "@/lib/i18n-content";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const statusStyle = {
  disponible: "bg-lime text-ink",
  "poques-places": "bg-paper text-ink",
  complet: "bg-transparent text-paper/60 ring-1 ring-paper/20 line-through",
} as const;

/** Llista de properes dates amb estat. `bookingQuery` pre-omple el configurador. */
export function DatesList({
  dates,
  pack,
  light = false,
}: {
  dates: SessionDate[];
  pack?: string;
  light?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();

  if (dates.length === 0) {
    return (
      <p
        className={cn("rounded-brand p-6", light ? "bg-paper" : "bg-graphite")}
      >
        {t("common.noDates")}
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "divide-y overflow-hidden rounded-brand",
        light
          ? "divide-ink/10 bg-paper text-ink"
          : "divide-paper/10 bg-graphite text-paper",
      )}
    >
      {dates.map((date) => {
        const bookable = isBookable(date.status);
        const query: Record<string, string> = {
          format: date.format,
          date: date.id,
        };
        if (pack) query.pack = pack;
        return (
          <li
            key={date.id}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-6"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-extrabold uppercase">
                {formatDateRange(date, locale)}
              </p>
              <p
                className={cn(
                  "text-sm",
                  light ? "text-ink/60" : "text-paper/60",
                )}
              >
                {tr(formats[date.format].badge, locale)}
                {date.note && <> · {tr(date.note, locale)}</>}
              </p>
            </div>
            <span
              className={cn(
                "skew-box rounded-[3px] px-2.5 py-1",
                date.status === "complet" && light
                  ? "text-ink/60 ring-1 ring-ink/20 line-through"
                  : statusStyle[date.status],
                date.status === "poques-places" &&
                  light &&
                  "!bg-ink !text-lime",
              )}
            >
              <span className="eyebrow !text-[0.62rem] !tracking-[0.18em]">
                {t(`common.status.${date.status}`)}
              </span>
            </span>
            {bookable ? (
              <Link
                href={{ pathname: "/reserva", query }}
                className={cn(
                  "inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] hover:underline",
                  light ? "text-ink" : "text-lime",
                )}
              >
                {t("format.requestDate")}
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            ) : (
              <span className="w-[1px]" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
