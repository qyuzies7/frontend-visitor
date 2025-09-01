/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Atur Poppins sebagai font default untuk font-sans
      },
      colors: {
        customBlue: {
          DEFAULT: '#1E3A8A',
          hover: '#162c66',
        },
      },
    },
  },
  plugins: [],
};