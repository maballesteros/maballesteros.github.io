const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', ...defaultTheme.fontFamily.sans],
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans]
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.35)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
