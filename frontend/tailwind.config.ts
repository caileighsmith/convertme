import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  "#f5f1e7",   // canvas bg
          100: "#fbf8f0",   // raised surface
          200: "#ece5d2",   // active/selected surface
          300: "#e3dcc6",   // surface-3
          400: "#e0d8c2",   // hairline border (--line)
          500: "#cfc6ad",   // darker border (--line-2)
        },
        navy: {
          600: "#b3aa97",   // ink-4 — very muted
          700: "#8a8170",   // ink-3 — muted label
          800: "#5a5044",   // ink-2 — secondary text
          900: "#1a1612",   // ink — primary text
        },
        gold: {
          400: "#a8651f",   // ochre accent
          500: "#8c5217",   // darker ochre
        },
      },
      fontFamily: {
        hebrew:  ["Frank Ruhl Libre", "serif"],
        heading: ["Newsreader", "Frank Ruhl Libre", "serif"],
        body:    ["Inter Tight", "Inter", "system-ui", "sans-serif"],
        ui:      ["Inter Tight", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":       "fadeIn 0.2s ease-out",
        "scale-in":      "scaleIn 0.15s ease-out",
        "slide-in-right":"slideInRight 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
