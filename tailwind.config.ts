import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#f5f5f5",
        primaryPoint: "#0070f3",
        darkPrimary: "#1f2937",
        darkSecond: "#161d27",
        darkPoint: "#fd26a0",
      },
    },
  },
  plugins: [],
} satisfies Config;
