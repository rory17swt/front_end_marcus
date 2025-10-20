/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'signature': ['Great Vibes', 'cursive'],
        'serif': ['Playfair Display', 'serif'],
        'body': ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}