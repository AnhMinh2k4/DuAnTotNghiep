import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        ivory: "#f7f3ed",
        linen: "#ede4d8",
        taupe: "#b99b84",
        graphite: "#2d2a27",
        sage: "#8fae9a",
        skywash: "#dbeafe",
        copper: "#c26a45",
        porcelain: "#fbfaf7",
      },
      fontFamily: {
        sans: ["Segoe UI", "Arial", "sans-serif"],
        serif: ["Segoe UI", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(21, 21, 21, 0.12)",
        lift: "0 18px 50px rgba(21, 21, 21, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
