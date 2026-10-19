import { useLocale } from "next-intl";
import type { Faq } from "@/content/faq";
import { tr } from "@/lib/i18n-content";
import { AccordionItem } from "@/components/ui/Accordion";

export function FaqList({
  items,
  light = false,
}: {
  items: Faq[];
  light?: boolean;
}) {
  const locale = useLocale();
  return (
    <div
      className={light ? "border-t border-ink/15" : "border-t border-paper/15"}
    >
      {items.map((f, i) => (
        <AccordionItem key={i} title={tr(f.q, locale)} light={light}>
          <p>{tr(f.a, locale)}</p>
        </AccordionItem>
      ))}
    </div>
  );
}

export function faqJsonLd(items: Faq[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: tr(f.q, locale),
      acceptedAnswer: { "@type": "Answer", text: tr(f.a, locale) },
    })),
  };
}
