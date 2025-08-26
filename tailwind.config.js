/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wood: {
          50: "#fdf8f3",
          100: "#faeee1",
          200: "#f4dcc2",
          300: "#ecc498",
          400: "#e2a66c",
          500: "#d98b4a",
          600: "#cb743f",
          700: "#a95d36",
          800: "#884b32",
          900: "#6f3e2b",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
