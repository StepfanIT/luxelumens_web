/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07182b',
        navy: '#0b2545',
        skybrand: '#1566d1',
        aqua: '#0eaec3',
        butter: '#f7c873',
        porcelain: '#f6f9fc',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(11, 37, 69, 0.12)',
        lift: '0 28px 90px rgba(7, 24, 43, 0.16)',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        grid:
          'linear-gradient(rgba(11,37,69,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,37,69,.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
