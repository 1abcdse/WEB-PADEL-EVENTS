import type { ReactNode } from "react";

/** Enllaç injectable: `next/link` a la web i un enllaç intern a la demo. */
export type LinkComponent = (props: { href: string; className?: string; children: ReactNode }) => ReactNode;
