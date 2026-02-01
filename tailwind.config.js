/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
  theme: {
    extend: {
      colors: {
        // Couleurs CEET - Light/Corporate Mode
        primary: '#E3001B',      // Rouge CEET
        secondary: '#FDB913',    // Jaune/Orange CEET
        tertiary: '#1F2937',     // Gris foncé pour texte
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

