/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D1001F',
          redDark: '#A5001A',
          blue: '#283A90',
          blueDark: '#1F2C70',
          mist: '#DBE2EC',
        },
      },
    },
  },
  plugins: [],
}
