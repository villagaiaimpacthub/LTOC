/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        background: '#e8e3dd',
        foreground: '#2D2928',
        card: '#ffffff',
        'card-foreground': '#2D2928',
        primary: {
          DEFAULT: '#B79277',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#406B63',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#949FAB',
          foreground: '#2D2928',
        },
        accent: {
          DEFAULT: '#254956',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#8C1352',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
