"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Missatge precarregat: si som a la pàgina d'un pack, l'esmenta */
export function useWhatsAppMessage(packNames: Record<string, string>) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const match = pathname.match(/^\/experiencies\/[^/]+\/([^/]+)/);
  const pack = match ? packNames[match[1]!] : undefined;
  return pack ? t("whatsappPack", { pack }) : t("whatsappGeneric");
}

/** Botó flotant de WhatsApp (desktop/tablet; al mòbil és a la barra CTA inferior) */
export function WhatsAppButton({
  packNames,
}: {
  packNames: Record<string, string>;
}) {
  const t = useTranslations("nav");
  const message = useWhatsAppMessage(packNames);
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className={cn(
        "group fixed bottom-6 right-6 z-40 hidden h-14 items-center gap-0 overflow-hidden rounded-full bg-[#25D366] pl-4 pr-4 text-ink shadow-lg shadow-black/30 transition-[gap,padding] duration-300 hover:gap-2 hover:pr-5 md:flex",
      )}
    >
      <Icon name="whatsapp" className="h-6 w-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-xs font-bold uppercase tracking-[0.12em] transition-[max-width] duration-300 group-hover:max-w-[200px]">
        WhatsApp
      </span>
    </a>
  );
}
