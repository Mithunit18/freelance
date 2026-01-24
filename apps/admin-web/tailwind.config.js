/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',           // your app pages/components
    './components/**/*.{js,ts,jsx,tsx}',    // local components
    '../../packages/ui-web/**/*.{ts,tsx}',  // include shared ui-web package
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
