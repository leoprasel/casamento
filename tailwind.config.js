/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Blush / champagne wedding palette (design tokens)
        blush: {
          50: '#fdf6f4',
          100: '#fbeae6',
          200: '#f6d4cc',
          300: '#eeb5a8',
          400: '#e29385',
          500: '#d1735f',
          600: '#b95846',
        },
        champagne: {
          50: '#fbf8f1',
          100: '#f5edda',
          200: '#ebdcb9',
          300: '#dcc38a',
          400: '#cba85f',
        },
        ivory: '#fffdf9',
        ink: {
          DEFAULT: '#3d2b28',
          soft: '#6b544f',
          muted: '#9a837d',
        },
        gold: '#b8935a',
      },
      fontFamily: {
        // Great Vibes = script display; Cormorant Garamond = quiet body serif
        script: ['"Great Vibes"', 'cursive'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        // Fluid display scale
        display: ['clamp(3rem, 12vw, 7rem)', { lineHeight: '1.05' }],
        title: ['clamp(2rem, 7vw, 4rem)', { lineHeight: '1.1' }],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(61, 43, 40, 0.25)',
        lift: '0 18px 40px -14px rgba(61, 43, 40, 0.35)',
        seal: '0 4px 14px -2px rgba(185, 88, 70, 0.5)',
      },
      backgroundImage: {
        'paper-texture':
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0%, transparent 45%), radial-gradient(circle at 80% 0%, rgba(245,237,218,0.5) 0%, transparent 40%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out both',
        'bounce-soft': 'bounce-soft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
