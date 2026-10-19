import type { Config } from "tailwindcss";

// Tokens de marca: els valors viuen com a variables CSS a src/app/globals.css
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: token("ink"),
        lime: token("lime"),
        paper: token("paper"),
        stone: token("stone"),
        graphite: token("graphite"),
        mute: token("mute"),
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: [
          "clamp(2.25rem, 0.6rem + 7vw, 7.5rem)",
          { lineHeight: "0.92", letterSpacing: "-0.02em" },
        ],
        display: [
          "clamp(2.25rem, 1.4rem + 4vw, 4.75rem)",
          { lineHeight: "0.95", letterSpacing: "-0.015em" },
        ],
        h2: [
          "clamp(1.875rem, 1.3rem + 2.6vw, 3.5rem)",
          { lineHeight: "1", letterSpacing: "-0.01em" },
        ],
        h3: ["clamp(1.25rem, 1.1rem + 0.7vw, 1.75rem)", { lineHeight: "1.15" }],
        giant: [
          "clamp(4.5rem, 2.5rem + 9vw, 10rem)",
          { lineHeight: "0.85", letterSpacing: "-0.04em" },
        ],
      },
      letterSpacing: {
        brand: "0.25em",
      },
      borderRadius: {
        brand: "10px",
      },
      boxShadow: {
        lime: "0 10px 30px -10px rgb(var(--lime) / 0.65)",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
