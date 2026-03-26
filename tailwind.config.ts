import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#071119",
        surface: "#0d1722",
        surface2: "#132232",
        line: "#1f3449",
        accent: "#9fe870",
        accent2: "#65d6ff",
        text: "#f2f6fb",
        muted: "#8ea4b8",
        danger: "#fb7185",
        warning: "#fbbf24"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(159,232,112,0.16), 0 20px 60px rgba(0,0,0,0.45)",
        card: "0 20px 45px rgba(3,10,18,0.55)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(101,214,255,0.16), transparent 30%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
      },
      backgroundSize: {
        "hero-grid": "auto, 36px 36px, 36px 36px"
      }
    }
  },
  plugins: []
};

export default config;
