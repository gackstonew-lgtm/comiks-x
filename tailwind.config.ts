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
          950: "#07090e",
          900: "#0c1017",
          850: "#111722",
          800: "#171f2e",
          700: "#222d42",
          600: "#334155",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          100: "#f1f5f9",
          50: "#f8fafc",
        },
        comic: {
          yellow: "#f59e0b",
          gold: "#d97706",
          red: "#ef4444",
          purple: "#8b5cf6",
          cyan: "#06b6d4",
          green: "#10b981",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
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
