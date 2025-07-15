/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        meitrex_primary_a0: "var(--color-muitheme-primary-a0)",
        meitrex_primary_a10: "var(--color-muitheme-primary-a10)",
        meitrex_primary_a20: "var(--color-muitheme-primary-a20)",
        meitrex_primary_a30: "var(--color-muitheme-primary-a30)",
        meitrex_primary_a40: "var(--color-muitheme-primary-a40)",
        meitrex_primary_a50: "var(--color-muitheme-primary-a50)",

        meitrex_secondary: "var(--color-muitheme-secondary)",

        meitrex_surface_a0: "var(--color-muitheme-surface-a0)",
        meitrex_surface_a10: "var(--color-muitheme-surface-a10)",
        meitrex_surface_a20: "var(--color-muitheme-surface-a20)",
        meitrex_surface_a30: "var(--color-muitheme-surface-a30)",
        meitrex_surface_a40: "var(--color-muitheme-surface-a40)",
        meitrex_surface_a50: "var(--color-muitheme-surface-a50)",

        meitrex_assessment_quiz: "var(--color-muitheme-assessment-quiz)",
        meitrex_assessment_fc: "var(--color-muitheme-assessment-fc)",
        meitrex_assessment_media: "var(--color-muitheme-assessment-media)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
