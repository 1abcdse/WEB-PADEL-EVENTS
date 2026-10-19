import { cn } from "@/lib/cn";

/** Icona PS (paral·lelogram + franja llima + pilota). ⚠️ Recreació provisional del logo. */
export function LogoMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const body = inverted ? "#FFFFFF" : "#0B0B0B";
  const letters = inverted ? "#0B0B0B" : "#FFFFFF";
  return (
    <svg viewBox="0 0 128 104" aria-hidden="true" className={className}>
      <polygon points="28,14 114,14 98,96 12,96" fill={body} />
      <polygon points="14.3,84 100.3,84 98,96 12,96" fill="#D6FF2E" />
      <text
        x="56"
        y="73"
        textAnchor="middle"
        fontWeight={900}
        fontStyle="italic"
        fontSize="54"
        fill={letters}
        letterSpacing="-2"
        style={{ fontFamily: "var(--font-archivo), 'Arial Black', sans-serif" }}
      >
        PS
      </text>
      <circle
        cx="113"
        cy="15"
        r="11"
        fill="#D6FF2E"
        stroke={body}
        strokeWidth="2.5"
      />
      <path
        d="M104.5 9.5c5 2.5 7 8 5.5 14M121.5 20.5c-5-2.5-7-8-5.5-14"
        fill="none"
        stroke={body}
        strokeWidth="1.8"
      />
    </svg>
  );
}

/** Logo horitzontal: icona + línia vertical + wordmark espaiat */
export function Logo({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const onDark = tone === "light";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-9 w-auto sm:h-10" inverted={onDark} />
      <span
        className={cn("h-8 w-px", onDark ? "bg-paper/40" : "bg-ink/40")}
        aria-hidden="true"
      />
      <span
        className={cn(
          "font-display text-[0.62rem] font-semibold uppercase leading-[1.35] tracking-brand sm:text-[0.7rem]",
          onDark ? "text-paper" : "text-ink",
        )}
      >
        Padel System
        <br />
        Academy
      </span>
    </span>
  );
}
