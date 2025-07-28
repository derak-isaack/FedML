/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          50: "#f0f4f8",
          100: "#dbe6ee",
          200: "#b6cadc",
          300: "#91aecb",
          400: "#6c92b9",
          500: "#4776a8", // base steel blue
          600: "#385e86",
          700: "#2a4664",
          800: "#1b2e42",
          900: "#0d1621",
        },
      },
    fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
