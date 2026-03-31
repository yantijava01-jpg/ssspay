/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          300: "#fde68a",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        dark: {
          900: "#0a0a0f",
          800: "#111118",
          700: "#1a1a24",
          600: "#22222f",
          500: "#2a2a3a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)",
        "dark-gradient": "linear-gradient(135deg, #1a1a24 0%, #0a0a0f 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(245, 158, 11, 0.3)",
        "gold-lg": "0 0 40px rgba(245, 158, 11, 0.4)",
        glass: "0 8px 32px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245,158,11,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(245,158,11,0.6)" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
