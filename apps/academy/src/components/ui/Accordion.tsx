import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/** Acordió accessible amb <details> natiu (funciona sense JS) */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  light = false,
  meta,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  light?: boolean;
  meta?: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group border-b py-1 [&_summary::-webkit-details-marker]:hidden",
        light ? "border-ink/15" : "border-paper/15",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-left">
        <span className="flex-1 font-display text-base font-bold sm:text-lg">
          {title}
        </span>
        {meta}
        <span
          className={cn(
            "skew-box flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] transition-colors",
            light
              ? "bg-ink text-paper group-open:bg-lime group-open:text-ink"
              : "bg-paper/10 group-open:bg-lime group-open:text-ink",
          )}
          aria-hidden="true"
        >
          <Icon
            name="plus"
            className="h-4 w-4 transition-transform duration-300 group-open:rotate-45"
          />
        </span>
      </summary>
      <div
        className={cn(
          "pb-6 pr-12 leading-relaxed",
          light ? "text-ink/75" : "text-paper/75",
        )}
      >
        {children}
      </div>
    </details>
  );
}
