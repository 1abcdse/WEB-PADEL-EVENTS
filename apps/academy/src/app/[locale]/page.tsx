import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Eyebrow, LimeBar } from "@/components/ui/Brand";

// Fase 1: pàgina provisional. La Home completa arriba a la Fase 2.
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
    <main className="flex min-h-dvh flex-col bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-5 py-20 sm:px-8">
        <Logo tone="dark" className="w-64 sm:w-80" />
        <Eyebrow className="text-lime">{t("eyebrow")}</Eyebrow>
        <h1 className="max-w-4xl font-display text-hero font-black uppercase italic">{t("title")}</h1>
        <p className="max-w-xl text-lg text-paper/80">{t("subtitle")}</p>
        <div>
          <Button href="/styleguide" size="lg">
            {t("styleguideLink")}
          </Button>
        </div>
      </div>
      <LimeBar />
    </main>
  );
}
