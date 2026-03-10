import type { Config } from "tailwindcss";

const config: Config = {
  // ── Dark mode via class (we toggle .dark on <html>)
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── Custom colors that map to CSS variables
      colors: {
        theme: {
          bg: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          border: "var(--border-color)",
          input: "var(--input-bg)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },

      // ── Border radius
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },

      // ── Backdrop blur
      backdropBlur: {
        xs: "2px",
        xl: "24px",
      },

      // ── Box shadows
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        modal: "0 25px 50px rgba(0,0,0,0.50)",
        glow: "0 0 20px rgba(59,130,246,0.15)",
      },

      // ── Animations (matches our @keyframes in globals.css)
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.0)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "fade-in-scale": "fadeInScale 0.2s ease forwards",
        "slide-in-left": "slideInLeft 0.3s ease forwards",
        "pulse-ring": "pulseRing 1.5s ease-out infinite",
      },
    },
  },

  plugins: [],
};

export default config;
