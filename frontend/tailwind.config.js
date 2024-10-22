/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', 'index.html'],
  theme: {
    extend: {
      colors: {
        pokemonBlue: '#3B4CCA',
        pokemonYellow: '#FFCB05',
        pokemonRed: '#CC0000',
        lightYellow: '#FFFAE5',
        lightBlue: '#E5F0FF',
      },
      backgroundImage: {
        'pokemon-pattern': "url('pokeball.jpg')",
      },
      boxShadow: {
        card: '0px 8px 15px rgba(0, 0, 0, 0.15)',
        button: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        pokemon: ['"Press Start 2P"', 'cursive'], // A retro game font
      },
      animation: {
        'move-pattern': 'movePattern 30s linear infinite',
      },
      keyframes: {
        movePattern: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '1000px 1000px' },
        },
      },
    },
  },
  plugins: [],
}
