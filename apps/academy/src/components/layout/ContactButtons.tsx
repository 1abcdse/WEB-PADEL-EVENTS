"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOOK_HREF } from "@/content/nav";
import { whatsappLink } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/Icon";

/**
 * Missatge precarregat de WhatsApp. Les pàgines de pack el poden canviar
 * (Fase 3) passant `packName` per indicar de quin pack es parla.
 */
function useWhatsappHref(packName?: string) {
  const t = useTranslations("contact");
  return whatsappLink(packName ? t("whatsappPack", { pack: packName }) : t("whatsappGeneric"));
}

/** Botó flotant de WhatsApp (escriptori i tauleta). */
export function WhatsAppButton({ packName }: { packName?: string }) {
  const t = useTranslations("common");
  const href = useWhatsappHref(packName);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-6 right-6 z-40 hidden size-14 place-items-center rounded-full bg-lime text-ink shadow-[0_10px_32px_-8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 md:grid"
    >
      <Icon name="whatsapp" size={28} />
    </a>
  );
}

/** Barra CTA fixa a baix (només mòbil): Reserva + WhatsApp. */
export function StickyCTA({ packName }: { packName?: string }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const href = useWhatsappHref(packName);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-ink/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="flex gap-3">
        <Link
          href={BOOK_HREF}
          className="ps-skew flex min-h-12 flex-1 items-center justify-center rounded-[4px] bg-lime font-display text-sm font-extrabold uppercase tracking-[0.12em] text-ink"
        >
          <span className="ps-unskew inline-flex items-center gap-2">
            {t("book")}
            <Icon name="arrow" size={18} strokeWidth={2.4} />
          </span>
        </Link>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={tc("whatsapp")}
          className="ps-skew grid min-h-12 w-14 place-items-center rounded-[4px] border-2 border-paper text-paper"
        >
          <span className="ps-unskew">
            <Icon name="whatsapp" size={24} />
          </span>
        </a>
      </div>
    </div>
  );
}
