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
        main: "#232930",
        secondary: "#e89688",
        lightMain: "#fcfcfc",
        lightText: "#4e4e4e",
        lightBorder: "#e9e9e9",
      },
      backgroundImage: {},
    },
  },
  plugins: [],
} satisfies Config;
