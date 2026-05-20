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
        background: "var(--background)",
        foreground: "var(--foreground)",
        'loak-blue': '#00A5CF',
        'loak-blue-dark': '#0085A8',
        'loak-light': '#F0F9FF',
      },
    },
  },
  plugins: [],
};
export default config;
