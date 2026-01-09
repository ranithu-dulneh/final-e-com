/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          100: '#F9F1D8',
          200: '#F0E3B1',
          300: '#E6D58B',
          400: '#DCC765',
          500: '#D4AF37', // Base gold
          600: '#AA8C2C',
          700: '#806921',
          800: '#554616',
          900: '#2B230B',
        },
        black: '#000000',
        white: '#FFFFFF',
        'off-white': '#FAFAFA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
