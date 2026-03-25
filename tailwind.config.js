/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        handwritten: ['"Reenie Beanie"', 'cursive'],
        heading: ['"Work Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        /* ── Figma Design System ── */

        // Neutrals
        neutral: {
          0:    '#FFFFFF',
          200:  '#E1DEE2',
          300:  '#B4ADB8',
          500:  '#685F6D',
          900:  '#525766',
          1000: '#00071A',
        },

        // Accents
        accent: {
          DEFAULT: '#C2FF4E',
          green:   '#C2FF4E',
          blue:    '#0016DE',
          orange:  '#FF4C19',
          pink:    '#FF87CD',
        },

        // Primary
        primary: {
          DEFAULT: '#001A5C',
        },

        // Background
        bg: {
          primary: '#F6F5F2',
        },

        // Shadow token (reference only, used via boxShadow)
        // shadow-200: 0px 1px 4px rgba(12,12,13,0.05), 0px 1px 4px rgba(12,12,13,0.1)

        /* ── Legacy location-type colors (used by safelist pattern) ── */
        restaurant:         { DEFAULT: '#fff3cd', border: '#f59e0b', text: '#78350f' },
        cafe:               { DEFAULT: '#fff3cd', border: '#f59e0b', text: '#78350f' },
        art_culture:        { DEFAULT: '#ede9fe', border: '#7c3aed', text: '#3b0764' },
        museum:             { DEFAULT: '#ede9fe', border: '#7c3aed', text: '#3b0764' },
        nature:             { DEFAULT: '#dcfce7', border: '#16a34a', text: '#14532d' },
        tourist_attraction: { DEFAULT: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
        hotel:              { DEFAULT: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
        shopping:           { DEFAULT: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
      },
      boxShadow: {
        200: '0px 1px 4px 0px rgba(12, 12, 13, 0.05), 0px 1px 4px 0px rgba(12, 12, 13, 0.1)',
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary|accent|neutral|bg|restaurant|cafe|art_culture|museum|nature|tourist_attraction|hotel|shopping)/,
    },
  ],
};
