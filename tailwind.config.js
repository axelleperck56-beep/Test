/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          green: {
            950: '#022c22',
            900: '#064e3b',
            800: '#065f46',
            700: '#047857',
          },
          amber: {
            600: '#d97706',
            500: '#f59e0b',
            400: '#fbbf24',
          },
        },
      },
      backgroundImage: {
        'wood-gradient': 'linear-gradient(135deg, #022c22 0%, #064e3b 60%, #1c3a2a 100%)',
      },
    },
  },
  plugins: [],
}
