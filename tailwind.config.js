/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2c1810',
          hover: '#6b4c40',
        },
        secondary: {
          DEFAULT: '#f8f5f0',
          darker: '#f4ede4',
          border: '#e6dfd7',
        },
        height: {
          screen: "100dvh",
        },
        minHeight: {
          screen: "100dvh",
        },
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary|secondary)/,
    },
  ],
}; 