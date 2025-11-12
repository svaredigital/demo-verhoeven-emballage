/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wood-brown': '#8B4513',
        'wood-light': '#DEB887',
        'forest-green': '#228B22',
        'sage-green': '#9CAF88',
      }
    },
  },
  plugins: [],
}