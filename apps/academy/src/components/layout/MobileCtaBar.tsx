"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/Icon";
import { useWhatsAppMessage } from "./WhatsAppButton";

/** Barra CTA fixa a baix (només mòbil): Reserva + WhatsApp */
export function MobileCtaBar({
  packNames,
}: {
  packNames: Record<string, string>;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const message = useWhatsAppMessage(packNames);
  const match = pathname.match(/^\/experiencies\/([^/]+)\/([^/]+)/);
  const href = match
    ? { pathname: "/reserva", query: { format: match[1]!, pack: match[2]! } }
    : "/reserva";

  if (pathname.startsWith("/reserva")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[49] border-t border-paper/10 bg-ink/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur md:hidden">
      <div className="flex gap-3">
        <Link
          href={href}
          className="skew-box flex h-12 flex-1 items-center justify-center rounded-[4px] bg-lime font-display text-sm font-bold uppercase tracking-[0.14em] text-ink"
        >
          <span className="inline-flex items-center gap-2">
            {t("book")} <Icon name="arrow" className="h-4 w-4" />
          </span>
        </Link>
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("whatsapp")}
          className="skew-box flex h-12 w-14 items-center justify-center rounded-[4px] bg-[#25D366] text-ink"
        >
          <Icon name="whatsapp" className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
