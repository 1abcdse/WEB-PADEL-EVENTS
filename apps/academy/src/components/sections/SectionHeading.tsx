import { Ball } from "@/components/ui/Ball";

/** Capçalera de secció: eyebrow amb pilota + titular en cursiva. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  surface = "light",
  className = "",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  surface?: "light" | "dark";
  className?: string;
}) {
  const sub = surface === "dark" ? "text-paper/75" : "text-mute-strong";
  return (
    <div className={`max-w-3xl ${className}`}>
      <p className={`ps-eyebrow flex items-center gap-3 ${surface === "dark" ? "text-lime" : "text-ink"}`}>
        <Ball size={14} />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-display font-black uppercase italic [text-wrap:balance]">{title}</h2>
      {intro && <p className={`mt-5 max-w-2xl text-lg ${sub}`}>{intro}</p>}
    </div>
  );
}
