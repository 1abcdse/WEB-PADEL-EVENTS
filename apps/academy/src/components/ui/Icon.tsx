import type { SVGProps } from "react";

/** Icones pròpies (traç 1.75, estil net) per no afegir dependències. */
const paths = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  racket: (
    <>
      <ellipse cx="10" cy="9" rx="6" ry="6.5" />
      <path d="m14.2 13.6 5.3 5.9M8 7h.01M11 7h.01M9.5 10h.01M12.5 10h.01M7 10h.01" />
    </>
  ),
  bed: (
    <path d="M3 18v-8m0 4h18v4m0-4v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01" />
  ),
  meal: (
    <path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10m10-18c-2 1-3 3.5-3 7h3v11" />
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H3" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 10h17M8 3v4m8-4v4" />
    </>
  ),
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M16 5.5a3 3 0 0 1 0 6m2 7.5c-.3-2-1.3-3.4-2.8-4.1" />
    </>
  ),
  star: (
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  phone: (
    <path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  car: (
    <path d="M4 16.5V12l2-5h12l2 5v4.5M4 12h16M6.5 16.5v2m11-2v2M7 14h.01M17 14h.01" />
  ),
  train: (
    <>
      <rect x="5.5" y="3.5" width="13" height="13" rx="3" />
      <path d="M5.5 10h13M8 20l2-3.5m6 3.5-2-3.5M9 13.5h.01M15 13.5h.01" />
    </>
  ),
  plane: (
    <path d="M10.5 13.5 3 11l1.5-1.5 8 .5 4-4.5c1-1 2.5-1.2 3-.5s.5 2-.5 3l-4.5 4 .5 8L13.5 21 11 13.5" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.3 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.3-3.5-8.5s1-5.9 3.5-8.5z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="m10 9.2 5 2.8-5 2.8z" />
    </>
  ),
  tiktok: (
    <path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5M14 3.5c.3 2.6 2 4.3 5 4.5" />
  ),
  shield: <path d="M12 3.5 5 6v5.5c0 4.3 3 7.7 7 9 4-1.3 7-4.7 7-9V6z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="1.5" />
      <path d="m16 10.5 5-3v9l-5-3" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths | "whatsapp";

export function Icon({
  name,
  className,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  if (name === "whatsapp") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5zm0 17.3c-1.5 0-3-.4-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A7.8 7.8 0 1 1 12 19.8zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.4-.2z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
