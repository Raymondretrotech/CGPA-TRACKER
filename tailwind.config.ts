import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1224",
          900: "#0f1b33",
          800: "#152444",
          700: "#1c3059",
        },
        brand: {
          50: "#eef4ff",
          100: "#dbe8ff",
          200: "#b8d1ff",
          300: "#8ab3ff",
          400: "#548dff",
          500: "#2b68f5",
          600: "#1c4fd6",
          700: "#173fac",
          800: "#15368a",
          900: "#152f6e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 27, 51, 0.06), 0 1px 12px rgba(15, 27, 51, 0.04)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
