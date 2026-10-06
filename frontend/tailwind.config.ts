import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // <--- Enables class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          nav: "#161e2e",
          navSub: "#232f3e",
          bg: "#f2f3f3",
          border: "#eaeded",
          borderDark: "#d5dbdb",
          text: "#16191f",
          muted: "#687078",
          orange: "#ec7211",
          orangeHover: "#eb5f07",
          blue: "#0073bb",
          blueHover: "#00558b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Amazon Ember", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;