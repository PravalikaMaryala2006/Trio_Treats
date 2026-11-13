/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFEFA',
          100: '#FFF9F2',
          200: '#FDF3E7',
          300: '#F9E8D2',
        },
        beige: {
          100: '#F5EBE1',
          200: '#EEDDC9',
          300: '#E4CCB1',
          400: '#D5B695',
        },
        choco: {
          50: '#F7F3F0',
          100: '#EDE4DC',
          200: '#DBC5B5',
          300: '#C29F87',
          600: '#7B4B29',
          700: '#5C3419',
          800: '#3D2314',
          900: '#2A170C',
          950: '#1A0E07',
        },
        bakery: {
          pink: '#FAD2E1',
          'pink-light': '#FCE4EC',
          'pink-dark': '#E5989B',
          rose: '#D68C98',
          gold: '#D4A373',
          cherry: '#9B2226',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(61, 35, 20, 0.08)',
        'warm': '0 12px 35px -8px rgba(92, 52, 25, 0.15)',
        'glow': '0 0 25px rgba(250, 210, 225, 0.6)',
      }
    },
  },
  plugins: [],
}
