/** @type {import('tailwindcss').Config} */
// All brand decisions live here. Restyling the site = editing these tokens.
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B2530",
        deep: "#0F4C5C",
        brand: { DEFAULT: "#0C7C7C", dark: "#095F5F", light: "#5BC0BE" },
        signal: { DEFAULT: "#F2A93B", dark: "#DB9326" },
        mist: "#EAF4F4",
        line: "#D3E4E5",
        muted: "#4B6670",
      },
      fontFamily: {
        sans: ["IRANYekan", "Vazirmatn", "Tahoma", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "72rem" },
    },
  },
  plugins: [],
};
