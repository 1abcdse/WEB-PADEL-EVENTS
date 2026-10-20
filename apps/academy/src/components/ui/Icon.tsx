export type IconName =
  | "arrow"
  | "racket"
  | "bed"
  | "meal"
  | "chart"
  | "clock"
  | "moon"
  | "users"
  | "check"
  | "calendar"
  | "whatsapp";

const PATHS: Record<Exclude<IconName, "whatsapp">, React.ReactNode> = {
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  racket: (
    <>
      <rect x="6" y="2.5" width="11" height="13" rx="5.5" />
      <path d="M11.5 15.5v6" />
      <circle cx="9.5" cy="7" r=".6" fill="currentColor" />
      <circle cx="13.5" cy="7" r=".6" fill="currentColor" />
      <circle cx="11.5" cy="10" r=".6" fill="currentColor" />
    </>
  ),
  bed: <path d="M3 18V6m0 7h18v5M3 13V9h7a3 3 0 0 1 3 3v1M21 13v-1a3 3 0 0 0-3-3h-5" />,
  meal: <path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8a2 2 0 0 1-2 2M8 3v6M17 21V3c-2 1-3 4-3 7v3h3" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4m8-4v4" />
    </>
  ),
};

type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number };

/** Icones de traç fi, coherents entre elles. Decoratives per defecte. */
export function Icon({ name, size = 22, className, strokeWidth = 1.8 }: Props) {
  if (name === "whatsapp") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
