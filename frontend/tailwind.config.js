/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // <- THIS IS IMPORTANT
  theme: {
    extend: {},
  },
  plugins: [],
};
