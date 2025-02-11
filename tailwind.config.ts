
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1A1F2C", // Dark Purple from Supabase config
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#D6BCFA", // Light Purple from Supabase config
          foreground: "#1A1F2C",
        },
        accent: {
          DEFAULT: "#9b87f5", // Primary Purple from Supabase config
          foreground: "#1A1F2C",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        button: {
          primary: "#9b87f5", // Primary button color from Supabase
          secondary: "#7E69AB", // Secondary button color from Supabase
        },
        navbar: "#D6BCFA", // Navbar color from Supabase
        footer: {
          primary: "#1A1F2C", // Footer primary color from Supabase
          secondary: "#D6BCFA", // Footer secondary color from Supabase
          text: "#FFFFFF", // Footer text color from Supabase
        },
        text: "#1A1F2C", // Text color from Supabase
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
