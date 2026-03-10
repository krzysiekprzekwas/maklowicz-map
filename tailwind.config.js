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
        restaurant: { DEFAULT: '#fff3cd', border: '#f59e0b', text: '#78350f' },
        cafe:        { DEFAULT: '#fff3cd', border: '#f59e0b', text: '#78350f' },
        art_culture: { DEFAULT: '#ede9fe', border: '#7c3aed', text: '#3b0764' },
        museum:      { DEFAULT: '#ede9fe', border: '#7c3aed', text: '#3b0764' },
        nature:      { DEFAULT: '#dcfce7', border: '#16a34a', text: '#14532d' },
        tourist_attraction: { DEFAULT: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
        hotel:    { DEFAULT: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
        shopping: { DEFAULT: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },

      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary|secondary|restaurant|cafe|art_culture|museum|nature|tourist_attraction|hotel|shopping)/,
    },
  ],
}; 