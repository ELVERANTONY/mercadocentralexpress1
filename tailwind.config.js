/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        "primary-dark": "#6d28d9",
        "primary-soft": "#f5f3ff",
        "primary-border": "#ddd6fe",
      },
      boxShadow: {
        card: "0 20px 40px rgba(17, 24, 39, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pop": {
          "0%": { transform: "scale(0.98)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "soft-pop": "soft-pop 0.25s ease-out both",
        shake: "shake 0.6s ease-in-out infinite",
      },
      borderRadius: {
        xl2: "22px",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
