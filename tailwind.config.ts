import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Supabase Dark Theme Surface Scale
        studio: {
          950: "#121212", // Main canvas / background
          900: "#171717", // Topbar, elevated panel
          850: "#1c1c1c", // Cards, inputs, sidebar background
          800: "#232323", // Hover state for cards/buttons
          750: "#282828", // Elevated dropdowns / active items
          700: "#2e2e2e", // Default 1px borders
          600: "#3e3e3e", // Strong borders
          500: "#707070", // Muted text
          400: "#a0a0a0", // Secondary text
          300: "#c7c7c7",
          200: "#e0e0e0",
          100: "#ededed", // Primary text
          50: "#fafafa",
          border: "#2e2e2e",
        },
        // Supabase Brand Green Palette
        brand: {
          DEFAULT: "#3ecf8e",
          hover: "#34b27b",
          active: "#24b47e",
          surface: "rgba(62, 207, 142, 0.10)",
          border: "rgba(62, 207, 142, 0.25)",
          solid: "#006338",
          foreground: "#09090b",
          muted: "rgba(62, 207, 142, 0.15)",
        },
        // studioOrange aliased to Supabase Brand Green for seamless global backward-compatibility
        studioOrange: {
          DEFAULT: "#3ecf8e",
          hover: "#34b27b",
          active: "#24b47e",
          light: "#5ce6a8",
          muted: "rgba(62, 207, 142, 0.12)",
          border: "rgba(62, 207, 142, 0.30)",
        },
        surface: {
          canvas: "#121212",
          DEFAULT: "#171717",
          card: "#171717",
          sidebar: "#1c1c1c",
          elevated: "#1c1c1c",
          hover: "#232323",
          overlay: "#282828",
          border: "#2e2e2e",
          "border-strong": "#3e3e3e",
        },
        comic: {
          yellow: "#3ecf8e", // Harmonized with Supabase green
          gold: "#f59e0b",
          red: "#ef4444",
          purple: "#a855f7",
          cyan: "#06b6d4",
          green: "#3ecf8e",
          pink: "#ec4899",
        },
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        comic: ["Inter", "sans-serif"],
      },
      boxShadow: {
        supabase: "0 0 0 1px #2e2e2e",
        "supabase-card": "0 0 0 1px #2e2e2e, 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        "supabase-hover": "0 0 0 1px #3e3e3e, 0 4px 12px 0 rgba(0, 0, 0, 0.4)",
        "supabase-overlay": "0 0 0 1px #3e3e3e, 0 12px 32px 0 rgba(0, 0, 0, 0.6)",
        "supabase-brand": "0 0 0 1px rgba(62, 207, 142, 0.3), 0 0 16px -2px rgba(62, 207, 142, 0.2)",
      },
      transitionTimingFunction: {
        supabase: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "250": "250ms",
      },
    },
  },
  plugins: [],
};
export default config;
