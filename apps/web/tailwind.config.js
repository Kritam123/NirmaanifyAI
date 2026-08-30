/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          500: '#635BFF',
          600: '#4D3FF5',
        },
        violet: {
          500: '#8B5CF6',
        },
        cyan: {
          400: '#22D3EE',
        },
      },
    },
  },
  plugins: [],
};
