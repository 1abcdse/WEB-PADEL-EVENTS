import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Fotos placeholder d'Unsplash (vegeu src/content/images.ts). Afegiu aquí altres dominis si cal.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  poweredByHeader: false,
};

export default withNextIntl(config);
