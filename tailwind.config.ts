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
        brand: {
          wine: "#4E141B",
          "wine-dark": "#3A0E14",
          "wine-light": "#6A1C25",
          gold: "#C5A059",
          "gold-light": "#D8B878",
          "gold-dark": "#A48136",
          cream: "#FAF7F2",
          "cream-card": "#FFFFFF",
          "cream-soft": "#F5EFE6",
          border: "#E8DFD5",
          "border-dark": "#D6C7B8",
          text: "#2B1E1E",
          muted: "#6B5B56",
          dark: "#4E141B",
          black: "#2B1E1E",
          charcoal: "#3D2B2B",
          gray: "#7D6E6A",
          light: "#FAF7F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        none: "0px",
      }
    },
  },
  plugins: [],
};
export default config;
