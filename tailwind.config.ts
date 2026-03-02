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
          navy:         "rgb(var(--color-bg-primary-rgb)    / <alpha-value>)",
          blue:         "rgb(var(--color-bg-surface-rgb)    / <alpha-value>)",
          gold:         "rgb(var(--color-accent-rgb)        / <alpha-value>)",
          "gold-hover": "rgb(var(--color-accent-hover-rgb)  / <alpha-value>)",
          body:         "rgb(var(--color-text-body-rgb)     / <alpha-value>)",
          heading:      "rgb(var(--color-text-heading-rgb)  / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
