import { useTranslations } from "next-intl";
import { FORMATS } from "@/content/packs";
import type { FormatId } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FormatBadge, LimeBar } from "@/components/ui/Brand";
import { DayStrip } from "@/components/ui/DayStrip";
import { Counter } from "@/components/ui/Motion";

/** Targeta gran de format (per al "split screen" Cap de setmana vs Stage 4 dies). */
export function FormatCard({ format }: { format: FormatId }) {
  const t = useTranslations("formats");
  const tc = useTranslations("common");
  const f = FORMATS[format];

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-brand bg-ink text-paper">
      <div className="flex flex-1 flex-col gap-7 p-7 sm:p-10">
        <FormatBadge format={format} className="self-start" />
        <div>
          <h3 className="font-display text-display font-black uppercase italic">{t(`${format}.name`)}</h3>
          <p className="mt-3 max-w-md text-lg text-paper/80">{t(`${format}.summary`)}</p>
        </div>
        <DayStrip active={f.days} />
        <div className="mt-auto flex flex-wrap items-end justify-between gap-6">
          <p>
            <Counter value={f.maxHours} suffix="h" className="font-display text-giant font-black italic text-lime" />
            <span className="ps-eyebrow mt-2 block text-paper/70">{t(`${format}.maxHours`, { hours: f.maxHours })}</span>
          </p>
          <Button href={`/experiencies/${f.slug}`} size="lg">
            {tc("discoverPacks")}
          </Button>
        </div>
      </div>
      <LimeBar />
    </article>
  );
}
