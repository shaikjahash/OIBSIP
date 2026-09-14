/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        char: '#211815',
        semolina: '#F7EFE2',
        tomato: '#C4432B',
        tomatodark: '#9A3220',
        basil: '#4C6B4F',
        crust: '#D9A05B',
        ash: '#6B5F58',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        soft: '10px',
      },
    },
  },
  plugins: [],
};
