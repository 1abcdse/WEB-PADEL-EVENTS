import { useTranslations } from "next-intl";

/**
 * Espai reservat per a una foto real. Mostra un fons gràfic amb línies de pista
 * i una etiqueta "Foto pendent" perquè quedi clar què cal substituir.
 * Quan tinguis la foto, canvia aquest component per <Image /> de next/image
 * amb el mateix className.
 */
export function PhotoSlot({
  label,
  className = "",
  grayscale = false,
}: {
  label: string;
  className?: string;
  grayscale?: boolean;
}) {
  const t = useTranslations("photo");
  return (
    <div
      role="img"
      aria-label={`${t("replace")}: ${label}`}
      className={`relative overflow-hidden bg-graphite ${grayscale ? "grayscale" : ""} ${className}`}
    >
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="ps-photo-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a2a28" />
            <stop offset="1" stopColor="#121212" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#ps-photo-light)" />
        {/* Pista vista en perspectiva */}
        <g fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2">
          <path d="M60 290 L140 40 L260 40 L340 290 Z" />
          <path d="M100 165 L300 165" strokeOpacity="0.3" strokeWidth="3" />
          <path d="M120 103 L280 103 M80 228 L320 228 M200 103 L200 228" />
        </g>
        <circle cx="300" cy="70" r="12" fill="#d6ff2e" fillOpacity="0.85" />
      </svg>
      <span className="ps-eyebrow absolute bottom-3 left-3 rounded-[3px] bg-ink/80 px-2 py-1 text-[0.65rem] text-paper/80">
        {t("replace")} · {label}
      </span>
    </div>
  );
}
