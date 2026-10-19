import { useTranslations } from "next-intl";
import type { FormatId } from "@/lib/types";

/** Etiqueta curta en majúscules amb el tracking del wordmark. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`ps-eyebrow ${className}`}>{children}</p>;
}

/** Paral·lelogram inclinat genèric (etiquetes, fons de xifres). */
export function SkewTag({
  children,
  tone = "ink",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "ink" | "lime" | "paper";
  className?: string;
}) {
  const look = {
    ink: "bg-ink text-lime",
    lime: "bg-lime text-ink",
    paper: "bg-paper text-ink",
  }[tone];
  return (
    <span className={`ps-skew inline-block rounded-[3px] px-3 py-1.5 ${look} ${className}`}>
      <span className="ps-unskew ps-eyebrow">{children}</span>
    </span>
  );
}

/** Badge de format: sempre paral·lelogram negre amb text llima. */
export function FormatBadge({ format, className = "" }: { format: FormatId; className?: string }) {
  const t = useTranslations("formats");
  return (
    <SkewTag tone="ink" className={className}>
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className={format === "weekend" ? "size-2 rounded-full bg-lime" : "size-2 rotate-45 bg-lime"}
        />
        {t(`${format}.badge`)}
      </span>
    </SkewTag>
  );
}

/** Franja llima a la base dels blocs importants (com la del logo). */
export function LimeBar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`h-2 w-full bg-lime ${className}`} />;
}

/** Línia vertical fina, com el separador del logo horitzontal. */
export function VDivider({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block w-[3px] self-stretch bg-current ${className}`} />;
}
