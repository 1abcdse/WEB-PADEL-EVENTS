import { Link } from "@/i18n/navigation";
import { Ball } from "@/components/ui/Ball";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-5 text-paper">
      <div className="max-w-lg text-center">
        <Ball size={48} className="mx-auto" />
        <p className="mt-6 font-display text-giant font-black italic text-lime">404</p>
        <h1 className="mt-4 font-display text-title font-black uppercase italic">Pilota fora de pista</h1>
        <p className="mt-3 text-paper/80">Aquesta pàgina no existeix o encara l&apos;estem construint.</p>
        <Link href="/" className="ps-eyebrow mt-8 inline-block text-lime underline underline-offset-4">
          Tornar a l&apos;inici
        </Link>
      </div>
    </main>
  );
}
