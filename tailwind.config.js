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
        restaurant: {
          DEFAULT: '#fff3cd',
          border: '#ffc107',
          text: '#8c6d07',
        },
        tourist_attraction: {
          DEFAULT: '#e0d6f9',
          border: '#8a63d2',
          text: '#502d8e',
        },

      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary|secondary|restaurant|tourist_attraction)/,
    },
  ],
}; 