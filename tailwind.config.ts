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
        studio: {
          950: "#09090b",
          900: "#101014",
          850: "#141419",
          800: "#1a1a22",
          750: "#22222c",
          700: "#2a2a36",
          600: "#3f3f4e",
          500: "#71717a",
          400: "#a1a1aa",
          300: "#d4d4d8",
          200: "#e4e4e7",
          100: "#f4f4f5",
          50: "#fafafa",
          border: "rgba(255, 255, 255, 0.07)",
        },
        studioOrange: {
          DEFAULT: "#ff5a1f",
          hover: "#ff6e36",
          active: "#e04913",
          light: "#ff7d4d",
          muted: "rgba(255, 90, 31, 0.12)",
          border: "rgba(255, 90, 31, 0.35)",
        },
        comic: {
          yellow: "#ff5a1f", // Unified with reference warm orange for consistent branding
          gold: "#f59e0b",
          red: "#ef4444",
          purple: "#a855f7",
          cyan: "#06b6d4",
          green: "#10b981",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        comic: ["Bangers", "Impact", "sans-serif"],
      },
      backgroundImage: {
        "comic-dots": "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
