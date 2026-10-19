"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export function FieldError({ id, error }: { id: string; error?: string }) {
  const t = useTranslations("errors");
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-[#C2410C]">
      {t.has(error) ? t(error) : error}
    </p>
  );
}

export function TextField({
  id,
  label,
  error,
  textarea = false,
  className,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  textarea?: boolean;
  className?: string;
} & ComponentProps<"input"> &
  ComponentProps<"textarea">) {
  const base =
    "w-full rounded-brand border-2 bg-paper px-4 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none";
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            base,
            "py-3",
            error ? "border-[#C2410C]" : "border-ink/15",
          )}
          {...(props as ComponentProps<"textarea">)}
        />
      ) : (
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            base,
            "h-13 min-h-[52px]",
            error ? "border-[#C2410C]" : "border-ink/15",
          )}
          {...(props as ComponentProps<"input">)}
        />
      )}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

/** Opció gran seleccionable (radio o checkbox estilitzat) */
export function ChoiceCard({
  checked,
  children,
  disabled,
  ...props
}: { checked: boolean; children: ReactNode } & ComponentProps<"input">) {
  return (
    <label
      className={cn(
        "relative flex h-full cursor-pointer flex-col rounded-brand border-2 p-5 transition-[border-color,background-color,box-shadow] duration-200",
        checked
          ? "border-ink bg-paper shadow-[inset_0_-6px_0_rgb(var(--lime))]"
          : "border-ink/10 bg-paper/70 hover:border-ink/40",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        className="peer sr-only"
        disabled={disabled}
        checked={checked}
        {...props}
      />
      <span
        className={cn(
          "skew-box absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-[3px] border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
          checked ? "border-ink bg-ink text-lime" : "border-ink/25",
        )}
        aria-hidden="true"
      >
        {checked && <Icon name="check" className="h-4 w-4" />}
      </span>
      {children}
    </label>
  );
}

export function Stepper({
  id,
  label,
  value,
  min,
  max,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  return (
    <div>
      <p id={`${id}-label`} className="mb-2 text-sm font-semibold text-ink">
        {label}
      </p>
      <div
        className="flex items-center gap-3"
        role="group"
        aria-labelledby={`${id}-label`}
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${label} −1`}
          className="skew-box flex h-12 w-12 items-center justify-center rounded-[3px] bg-ink text-paper disabled:opacity-30"
        >
          <Icon name="minus" className="h-5 w-5" />
        </button>
        <output
          id={id}
          aria-live="polite"
          className="w-14 text-center font-display text-3xl font-black italic"
        >
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${label} +1`}
          className="skew-box flex h-12 w-12 items-center justify-center rounded-[3px] bg-ink text-paper disabled:opacity-30"
        >
          <Icon name="plus" className="h-5 w-5" />
        </button>
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}
