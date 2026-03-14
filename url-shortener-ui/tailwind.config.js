/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // Prevents Tailwind from breaking existing Vanilla CSS styles
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      colors: {
        space: {
          900: '#0B0B0F',
          800: '#13131A',
          700: '#1C1C26',
          600: '#2A2A38',
        },
        brand: {
          500: '#4F46E5', // Indigo
          400: '#818CF8',
          accent: '#06B6D4' // Cyan
        }
      }
    },
  },
  plugins: [],
}
