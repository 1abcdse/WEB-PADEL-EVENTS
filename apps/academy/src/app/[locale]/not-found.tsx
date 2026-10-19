import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="flex min-h-[80vh] items-center pt-[var(--header-h)]">
      <div className="container-brand">
        <p className="text-giant display-italic text-lime">404</p>
        <h1 className="mt-4 text-display font-black italic">{t("title")}</h1>
        <p className="mt-4 max-w-md text-paper/70">{t("text")}</p>
        <ButtonLink href="/" className="mt-10">
          {t("cta")}
        </ButtonLink>
      </div>
    </section>
  );
}
