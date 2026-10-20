import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary";
/** Sobre quin fons va el botó secundari (canvia el color del contorn) */
type Surface = "dark" | "light";

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  surface?: Surface;
  icon?: IconName | null;
  className?: string;
  size?: "md" | "lg";
};

type AsLink = Common & { href: string; external?: boolean; onClick?: never; type?: never };
type AsButton = Common & {
  href?: undefined;
  external?: never;
  onClick?: () => void;
  type?: "button" | "submit";
};

function classes(variant: Variant, surface: Surface, size: "md" | "lg", className = "") {
  const base =
    "group ps-skew inline-flex items-center justify-center rounded-[4px] font-display font-extrabold uppercase " +
    "tracking-[0.12em] transition-[transform,box-shadow,background-color,color] duration-300 ease-brand " +
    "focus-visible:outline-offset-4 min-h-12";
  const pad = size === "lg" ? "px-8 py-4 text-sm sm:text-base" : "px-6 py-3 text-xs sm:text-sm";
  const look =
    variant === "primary"
      ? "bg-lime text-ink hover:shadow-[0_10px_32px_-8px_rgba(214,255,46,0.65)] hover:-translate-y-0.5"
      : surface === "dark"
        ? "border-2 border-paper text-paper hover:bg-paper hover:text-ink"
        : "border-2 border-ink text-ink hover:bg-ink hover:text-paper";
  return `${base} ${pad} ${look} ${className}`;
}

function Inner({ children, icon }: { children: React.ReactNode; icon: IconName | null }) {
  return (
    <span className="ps-unskew inline-flex items-center gap-3">
      {children}
      {icon && (
        <Icon
          name={icon}
          size={18}
          strokeWidth={2.4}
          className="transition-transform duration-300 ease-brand group-hover:translate-x-1"
        />
      )}
    </span>
  );
}

/** Botó de marca: forma inclinada com el logo i fletxa que avança al hover. */
export function Button(props: AsLink | AsButton) {
  const { children, variant = "primary", surface = "dark", icon = "arrow", className, size = "md" } = props;
  const cls = classes(variant, surface, size, className);

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a href={props.href} className={cls} target="_blank" rel="noopener noreferrer">
          <Inner icon={icon}>{children}</Inner>
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        <Inner icon={icon}>{children}</Inner>
      </Link>
    );
  }
  return (
    <button type={props.type ?? "button"} onClick={props.onClick} className={cls}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
}
