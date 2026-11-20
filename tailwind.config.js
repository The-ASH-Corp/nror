/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryColor: 'var(--primaryColor)',
        secondaryColor: 'var(--secondaryColor)',
        goldColor: 'var(--goldColor)',
        silverColor: 'var(--silverColor)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.25em',
        widest: '0.35em',
      }
    },
  },
  plugins: [],
}
