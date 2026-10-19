import { useTranslations } from "next-intl";
import { Counter } from "@/components/ui/Counter";

/** Barra de xifres (fons llima, text negre) */
export function StatsBar() {
  const t = useTranslations("home.stats");
  const items = [
    { big: <Counter value={20} suffix="h" />, label: t("weekend") },
    { big: <Counter value={30} suffix="h" />, label: t("stage") },
    { big: t("allIn"), label: t("allInLabel"), text: true },
    { big: t("groups"), label: t("groupsLabel"), text: true },
  ];
  return (
    <section
      id="xifres"
      className="on-light bg-lime text-ink"
      aria-label="Padel System Academy"
    >
      <ul className="container-brand grid grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex flex-col justify-center border-ink/15 py-8 pr-4 odd:border-r sm:py-10 lg:border-r lg:pl-8 lg:first:pl-0 lg:last:border-r-0 [&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0 [&:nth-child(even)]:pl-4"
          >
            <span
              className={
                item.text
                  ? "font-display text-2xl font-black uppercase italic leading-none sm:text-3xl"
                  : "font-display text-6xl font-black italic leading-none tracking-tighter sm:text-7xl"
              }
            >
              {item.big}
            </span>
            <span className="mt-2 text-sm font-medium text-ink/70">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
