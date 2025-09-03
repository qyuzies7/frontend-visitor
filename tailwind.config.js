/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        customBlue: {
          DEFAULT: '#1E3A8A',
          hover: '#162c66',
        },
        kaiorange: '#ED6B23',
        kaiblue: '#408BA6',
      },
    },
  },
  plugins: [],
};