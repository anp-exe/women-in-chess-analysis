/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F3E9",
        sage: {
          50: "#F0F2EB",
          100: "#E1E7D4",
          200: "#C3CFA8",
          300: "#A5B77C",
          400: "#879F50",
          500: "#6B8838",
          600: "#55692C",
          700: "#3F4D20",
          800: "#2A3315",
          900: "#151A0A",
        },
        matcha: "#8FA968",
        rose: "#C47B7B",
        ink: "#2D2D2B",
        paper: "#FAF6ED",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
