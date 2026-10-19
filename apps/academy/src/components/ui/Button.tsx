import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ink" | "outline-ink" | "ghost";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-lime text-ink hover:shadow-lime",
  secondary:
    "border-2 border-paper/80 text-paper hover:bg-paper hover:text-ink",
  ink: "bg-ink text-paper hover:bg-graphite",
  "outline-ink": "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-paper hover:text-lime",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.7rem]",
  md: "h-12 px-6 text-xs",
  lg: "h-14 px-8 text-sm",
};

interface Common {
  variant?: Variant;
  size?: Size;
  /** Icona final. Per defecte, la fletxa → de marca. `null` per no mostrar-ne. */
  icon?: IconName | null;
  iconStart?: IconName;
  className?: string;
  children: ReactNode;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<Common, "variant" | "size" | "className">) {
  return cn(
    "group skew-box inline-flex shrink-0 items-center justify-center rounded-[4px] font-display font-bold uppercase tracking-[0.14em]",
    "transition-[background-color,color,box-shadow,transform] duration-300 ease-brand active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

function Inner({
  children,
  icon = "arrow",
  iconStart,
}: Pick<Common, "children" | "icon" | "iconStart">) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {iconStart && <Icon name={iconStart} className="h-[1.15em] w-[1.15em]" />}
      <span>{children}</span>
      {icon && (
        <Icon
          name={icon}
          className="h-[1.15em] w-[1.15em] transition-transform duration-300 ease-brand group-hover:translate-x-1"
        />
      )}
    </span>
  );
}

type LinkProps = Common & { href: ComponentProps<typeof Link>["href"] } & Omit<
    ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;

/** Botó-enllaç intern (respecta l'idioma actiu) */
export function ButtonLink({
  variant,
  size,
  icon,
  iconStart,
  className,
  children,
  ...props
}: LinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      <Inner icon={icon} iconStart={iconStart}>
        {children}
      </Inner>
    </Link>
  );
}

/** Botó-enllaç extern (WhatsApp, mailto, tel…) */
export function ButtonA({
  variant,
  size,
  icon,
  iconStart,
  className,
  children,
  ...props
}: Common & Omit<ComponentProps<"a">, "className" | "children">) {
  const external = props.href?.startsWith("http");
  return (
    <a
      className={buttonClasses({ variant, size, className })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      <Inner icon={icon} iconStart={iconStart}>
        {children}
      </Inner>
    </a>
  );
}

export function Button({
  variant,
  size,
  icon,
  iconStart,
  className,
  children,
  type = "button",
  ...props
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      <Inner icon={icon} iconStart={iconStart}>
        {children}
      </Inner>
    </button>
  );
}
