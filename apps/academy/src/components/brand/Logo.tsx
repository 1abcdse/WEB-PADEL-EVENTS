import {
  BALL,
  HORIZONTAL_WIDTH,
  MARK_VIEWBOX,
  PLATE_POINTS,
  PS_PATH,
  STRIP_POINTS,
  WORDMARK_PATH,
} from "./logo-paths";

type Props = {
  /** "mark" = només la placa PS · "horizontal" = placa + separador + wordmark */
  variant?: "mark" | "horizontal";
  /** "light" per a fons clars (placa negra) · "dark" per a fons foscos (placa blanca) */
  tone?: "light" | "dark";
  className?: string;
  title?: string;
};

const INK = "var(--color-ink)";
const PAPER = "var(--color-paper)";
const LIME = "var(--color-lime)";

function Mark({ tone }: { tone: "light" | "dark" }) {
  const plate = tone === "light" ? INK : PAPER;
  const letters = tone === "light" ? PAPER : INK;
  const { cx, cy, r } = BALL;
  const k = r * 0.9;
  return (
    <>
      <polygon points={PLATE_POINTS} fill={plate} />
      <polygon points={STRIP_POINTS} fill={LIME} />
      <path d={PS_PATH} fill={letters} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={LIME}
        stroke={tone === "light" ? INK : "none"}
        strokeWidth={r * 0.09}
      />
      <path
        d={`M${cx - k} ${cy - r * 0.42}Q${cx} ${cy + r * 0.05} ${cx + k} ${cy - r * 0.42}M${cx - k} ${cy + r * 0.42}Q${cx} ${cy - r * 0.05} ${cx + k} ${cy + r * 0.42}`}
        fill="none"
        stroke={INK}
        strokeWidth={r * 0.13}
        strokeLinecap="round"
      />
    </>
  );
}

export function Logo({ variant = "horizontal", tone = "light", className, title = "Padel System Academy" }: Props) {
  const ink = tone === "light" ? INK : PAPER;
  if (variant === "mark") {
    return (
      <svg viewBox={MARK_VIEWBOX} role="img" aria-label={title} className={className}>
        <Mark tone={tone} />
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${HORIZONTAL_WIDTH} 144`} role="img" aria-label={title} className={className}>
      <Mark tone={tone} />
      <rect x={282} y={26} width={4} height={100} fill={ink} />
      <path d={WORDMARK_PATH} fill={ink} />
    </svg>
  );
}
