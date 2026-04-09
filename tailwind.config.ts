import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FBF8F4",
          100: "#FAF3E8",
          200: "#F5EBE0",
          300: "#E8D5C0",
          400: "#D4B896",
          500: "#C4956A",
          600: "#B5865C",
          700: "#96704D",
          800: "#4A3728",
          900: "#2D2118",
        },
        warm: {
          bg: "#FBF8F4",
          card: "#FFFFFF",
          cardAlt: "#FEF7F0",
          border: "#F0E6DA",
          borderLight: "#F5EDE3",
          cream: "#FAF3E8",
        },
        sage: { DEFAULT: "#A3B5A0", light: "#E4ECE3" },
        rose: { DEFAULT: "#D4A0A0", light: "#F5E6E6" },
        lavender: { DEFAULT: "#B8A9C9", light: "#EDE8F2" },
        success: { DEFAULT: "#8DB580", light: "#E8F0E4" },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["DM Sans", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
