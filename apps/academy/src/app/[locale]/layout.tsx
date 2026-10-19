import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/i18n/routing";
import { packs, site } from "@/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CookieBanner } from "@/components/layout/CookieBanner";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("title"), template: `%s · ${site.name}` },
    description: t("description"),
    applicationName: site.name,
    icons: { icon: "/brand/logo-icon.svg", apple: "/brand/logo-icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  // Per al missatge precarregat de WhatsApp segons el pack visitat
  const packNames = Object.fromEntries(packs.map((p) => [p.slug, p.name]));

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marca que hi ha JS abans de pintar: activa les animacions d'entrada sense amagar contingut si no n'hi ha */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <a
            href="#contingut"
            className="sr-only z-[100] rounded bg-lime px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            {t("skip")}
          </a>
          <Header />
          <main id="contingut">{children}</main>
          <Footer />
          <MobileCtaBar packNames={packNames} />
          <WhatsAppButton packNames={packNames} />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
