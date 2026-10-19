import type { ReactNode } from "react";
import type { ImageKey } from "@/content/images";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";

/** Hero de pàgines interiors: foto amb overlay, eyebrow, titular en cursiva i franja llima */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  children,
  aside,
  compact = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  image?: ImageKey;
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "lime-stripe relative isolate flex items-end overflow-hidden bg-ink",
        compact ? "min-h-[52vh]" : "min-h-[72vh]",
      )}
    >
      {image && (
        <Photo
          image={image}
          priority
          className="!absolute inset-0 -z-10"
          overlay={0.6}
        />
      )}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent"
        aria-hidden="true"
      />
      <div className="container-brand pb-16 pt-[calc(var(--header-h)+56px)] sm:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {eyebrow && (
              <div className="eyebrow mb-5 flex flex-wrap items-center gap-3 text-paper/80">
                {eyebrow}
              </div>
            )}
            <h1 className="text-display font-black italic">{title}</h1>
            {subtitle && (
              <p className="mt-6 max-w-2xl text-lg text-paper/80">{subtitle}</p>
            )}
            {children && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {children}
              </div>
            )}
          </div>
          {aside && <div className="animate-rise lg:col-span-4">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
