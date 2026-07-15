/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Botanical olive + cream paper palette (design handoff tokens)
        page: '#cdc7b6', // outer body behind the phone column
        cream: {
          DEFAULT: '#F1EEE4', // paper / main column
          band: '#E7E2D4', // alternating section band
          card: '#F5F3EA', // section card fill
          input: '#F7F5EC', // inputs, gift cards, thank-you cards
        },
        olive: {
          DEFAULT: '#3B4A3A', // ink / primary dark / buttons
          body: '#4A5644', // paragraph text
          muted: '#6C7860', // eyebrows, labels, secondary
          accent: '#8A9179', // ampersand, divider diamond
          placeholder: '#A7A896', // input placeholders, mono captions
        },
        night: '#23261F', // intro video background
      },
      fontFamily: {
        script: ['"Pinyon Script"', 'cursive'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        column: '0 0 90px rgba(46,58,44,0.22)',
        cutout: '0 10px 16px rgba(46,58,44,0.14)',
      },
      keyframes: {
        floatArrow: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floatArrow: 'floatArrow 2.2s ease-in-out infinite',
        fadeIn: 'fadeIn 1s ease',
        fadeUp: 'fadeUp 0.5s ease both',
      },
    },
  },
  plugins: [],
}
