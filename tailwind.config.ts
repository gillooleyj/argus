import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0D1C2E",
          blue: "#1B3A6B",
          gold: "#C8943A",
          "gold-hover": "#D4A045",
          body: "#C8C8D0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
