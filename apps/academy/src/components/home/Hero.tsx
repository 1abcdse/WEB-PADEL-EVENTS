import { useTranslations } from "next-intl";
import { Photo } from "@/components/ui/Photo";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Hero a pantalla completa. Per posar un vídeo en loop, substitueix <Photo> per:
 * <video autoPlay muted loop playsInline poster="/img/hero.jpg" className="absolute inset-0 h-full w-full object-cover"><source src="/video/hero.mp4" type="video/mp4" /></video>
 */
export function Hero() {
  const t = useTranslations("home.hero");
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink">
      <Photo
        image="hero"
        priority
        className="!absolute inset-0 -z-10"
        overlay={0.5}
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/40"
        aria-hidden="true"
      />

      <div className="container-brand pb-28 pt-[calc(var(--header-h)+48px)] sm:pb-32">
        <p className="eyebrow animate-rise mb-6 flex items-center gap-3 text-lime">
          <span className="h-px w-10 bg-lime" aria-hidden="true" />
          {t("eyebrow")}
        </p>
        <h1 className="text-hero font-display font-black uppercase italic">
          {/* Sense animació d'entrada: és l'element LCP */}
          <span className="block">{t("title1")}</span>
          <span className="block text-lime">{t("title2")}</span>
        </h1>
        <p
          className="animate-rise mt-8 max-w-xl text-lg text-paper/85 sm:text-xl"
          style={{ animationDelay: "220ms" }}
        >
          {t("subtitle")}
        </p>
        <div
          className="animate-rise mt-10 flex flex-wrap gap-4"
          style={{ animationDelay: "300ms" }}
        >
          <ButtonLink href="/experiencies" size="lg">
            {t("ctaPacks")}
          </ButtonLink>
          <ButtonLink
            href="/contacte"
            variant="secondary"
            size="lg"
            icon={null}
          >
            {t("ctaTalk")}
          </ButtonLink>
        </div>
      </div>

      {/* Indicador de scroll amb la pilota */}
      <a
        href="#xifres"
        className="absolute bottom-8 right-4 hidden flex-col items-center gap-3 text-paper/70 hover:text-lime sm:right-10 sm:flex"
      >
        <span className="eyebrow [writing-mode:vertical-rl]">
          {t("scroll")}
        </span>
        <span className="relative h-14 w-px bg-paper/30" aria-hidden="true">
          <span className="animate-ball absolute -left-[7px] top-0 h-[15px] w-[15px] rounded-full bg-lime" />
        </span>
      </a>
    </section>
  );
}
