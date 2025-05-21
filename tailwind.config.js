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
        bg: "var(--color-muitheme-background)",
        bgSecondary: "var(--color-muitheme-bg-secondary)",
        bgSecondaryLight: "var(--color-muitheme-bg-secondary-light)",
        primaryDark: "var(--color-muitheme-primary-dark)",
        shadeLight: "var(--color-muitheme-shadeLight)",
        shadeDark: "var(--color-muitheme-shadeDark)",

        contentFC: "var(--color-muitheme-assessment-media)",
        contentMedia: "var(--color-muitheme-assessment-quiz)",
        contentQuiz: "var(--color-muitheme-assessment-fc)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
