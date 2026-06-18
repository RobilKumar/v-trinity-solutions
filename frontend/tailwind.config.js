/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f0ff',
          100: '#b3d0ff',
          200: '#80b0ff',
          300: '#4d90ff',
          400: '#1a70ff',
          500: '#0052cc',  // Brand primary
          600: '#003d99',
          700: '#002966',
          800: '#001433',
          900: '#000a1a',
        },
        secondary: {
          500: '#00b4d8',  // Cyan accent
          600: '#0096b7',
        },
        accent: {
          500: '#ff6b35',  // Orange CTA
          600: '#e55a25',
        },
        dark: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(135deg, #0a0e1a 0%, #0052cc 100%)",
        'card-gradient': "linear-gradient(135deg, rgba(0,82,204,0.1) 0%, rgba(0,180,216,0.05) 100%)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'count-up': 'countUp 2s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
