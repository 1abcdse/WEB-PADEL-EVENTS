"use client";

import { useState } from "react";
import { mapEmbedUrl, mapLinkUrl } from "@/content/site";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * Mapa de Google que només es carrega quan l'usuari ho demana:
 * no instal·la cookies de tercers sense consentiment i no penalitza el rendiment.
 */
export function MapEmbed({
  label,
  openLabel,
  className,
}: {
  label: string;
  openLabel: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-brand bg-graphite",
        className,
      )}
    >
      {loaded ? (
        <iframe
          src={mapEmbedUrl}
          title={label}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 grayscale-[0.6]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_40%,#262626,#111)] p-6 text-center">
          <svg
            viewBox="0 0 200 120"
            className="absolute inset-0 h-full w-full opacity-20"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path
              d="M0 80 C40 70 60 95 100 82 S160 50 200 60 M0 30 L200 45 M70 0 L90 120 M140 0 L120 120"
              stroke="#ECECE7"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <Icon name="pin" className="relative h-9 w-9 text-lime" />
          <div className="relative flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="skew-box h-10 rounded-[3px] bg-lime px-4 font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink"
            >
              <span>{label}</span>
            </button>
            <a
              href={mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="skew-box flex h-10 items-center rounded-[3px] border border-paper/40 px-4 font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-paper"
            >
              <span>{openLabel}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
