import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type Tone = "ink" | "paper" | "stone" | "graphite" | "lime";

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  graphite: "bg-graphite text-paper",
  paper: "on-light bg-paper text-ink",
  stone: "on-light bg-stone text-ink",
  lime: "on-light bg-lime text-ink",
};

export function Section({
  id,
  tone = "ink",
  className,
  children,
  stripe = false,
  ...rest
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  stripe?: boolean;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 sm:py-28",
        tones[tone],
        stripe && "lime-stripe",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  id,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-6 sm:mb-16",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="eyebrow mb-4 flex items-center gap-3 opacity-80">
            <span
              className="inline-block h-2 w-2 rounded-full bg-lime ring-1 ring-current"
              aria-hidden="true"
            />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base opacity-75 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </Reveal>
  );
}
