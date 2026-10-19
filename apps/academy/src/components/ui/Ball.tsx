type Props = {
  size?: number;
  className?: string;
  /** Color de la costura (per defecte, negre de marca) */
  seam?: string;
};

/** Pilota de pàdel: micro-detall de marca (punts de llista, scroll, loaders). */
export function Ball({ size = 16, className, seam = "var(--color-ink)" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="9.5" fill="var(--color-lime)" />
      <path
        d="M1.6 6.2Q10 10.8 18.4 6.2M1.6 13.8Q10 9.2 18.4 13.8"
        fill="none"
        stroke={seam}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
