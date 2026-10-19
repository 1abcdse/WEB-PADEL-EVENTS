import Image from "next/image";
import { useLocale } from "next-intl";
import { images, type ImageKey } from "@/content/images";
import { tr } from "@/lib/i18n-content";
import { cn } from "@/lib/cn";

/**
 * Foto de marca. Si la imatge no té `src` a src/content/images.ts, mostra un placeholder
 * gràfic (pista de pàdel en perspectiva) amb l'etiqueta FOTO perquè es vegi què cal substituir.
 */
export function Photo({
  image,
  className,
  sizes = "100vw",
  priority = false,
  overlay = 0,
  grayscaleHover = false,
}: {
  image: ImageKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Opacitat de l'overlay negre (0–0.6) per fer llegible el text a sobre */
  overlay?: number;
  /** B/N que passa a color en fer hover sobre el pare amb classe `group` */
  grayscaleHover?: boolean;
}) {
  const locale = useLocale();
  const data = images[image];
  const alt = tr(data.alt, locale);

  return (
    <div
      className={cn("grain relative overflow-hidden bg-graphite", className)}
    >
      {data.src ? (
        <Image
          src={data.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover",
            grayscaleHover &&
              "grayscale transition-[filter,transform] duration-500 ease-brand group-hover:scale-[1.03] group-hover:grayscale-0",
          )}
        />
      ) : (
        <Placeholder
          alt={alt}
          hint={data.hint}
          grayscaleHover={grayscaleHover}
        />
      )}
      {overlay > 0 && (
        <div
          className="absolute inset-0 bg-ink"
          style={{ opacity: overlay }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function Placeholder({
  alt,
  hint,
  grayscaleHover,
}: {
  alt: string;
  hint: string;
  grayscaleHover: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      title={`FOTO A SUBSTITUIR: ${hint}`}
      className="absolute inset-0"
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_20%,#2a2a2a_0%,#141414_55%,#0b0b0b_100%)]" />
      {/* Pista en perspectiva */}
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g fill="none" stroke="#ECECE7" strokeOpacity="0.14" strokeWidth="1.2">
          <path d="M110 70 L290 70 L380 300 L20 300 Z" />
          <path d="M80 150 L320 150" />
          <path d="M53 220 L347 220" strokeOpacity="0.22" />
          <path d="M200 70 L200 150 M200 220 L200 300" />
          <path d="M98 100 L302 100" strokeDasharray="4 6" />
        </g>
        <path
          d="M53 220 L347 220"
          stroke="#D6FF2E"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
      </svg>
      <span
        className={cn(
          "absolute right-[14%] top-[18%] h-4 w-4 rounded-full bg-lime/80 shadow-[0_0_30px_rgba(214,255,46,0.45)] sm:h-5 sm:w-5",
          grayscaleHover &&
            "grayscale transition-[filter] duration-500 group-hover:grayscale-0",
        )}
        aria-hidden="true"
      />
      <span className="eyebrow absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-[3px] bg-ink/70 px-2 py-1 !text-[0.6rem] text-paper/60">
        Foto · {hint}
      </span>
    </div>
  );
}
