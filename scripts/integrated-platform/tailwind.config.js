/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#B79277',
        secondary: '#406B63',
        accent: '#254956',
        background: '#e8e3dd',
        card: '#ffffff',
        muted: '#949FAB',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
