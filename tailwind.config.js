/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './en/index.html', './admin/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050506',
        night: '#0b0b0d',
        coal: '#121215',
        smoke: '#1b1b1f',
        mist: '#a1a1aa',
        cream: '#f4efe7',
        paper: '#ede8df',
        gold: {
          100: '#fbefd6',
          200: '#f6dba6',
          300: '#efc57a',
          400: '#e7b464',
          500: '#c9913f',
          600: '#9c6d2b',
        },
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.055em',
        display: '-0.045em',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      maxWidth: {
        page: '84rem',
      },
    },
  },
  plugins: [],
};
