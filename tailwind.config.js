/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAFAF7',
          100: '#F5F2EC',
          200: '#EDE8DF',
          300: '#DDD0B9',
          400: '#C0A882',
          500: '#9E8462',
          600: '#7A6445',
          700: '#5C4D32',
          800: '#3D3220',
          900: '#2C2416',
          950: '#1C1710',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'orb-breathe': 'orb-breathe 4s ease-in-out infinite',
        'orb-pulse': 'orb-pulse 2s ease-in-out infinite',
        'orb-wave': 'orb-wave 1.5s ease-in-out infinite',
        'orb-inner-wave': 'orb-inner-wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(180, 83, 9, 0.1)' },
          to: { boxShadow: '0 0 24px rgba(180, 83, 9, 0.25)' },
        },
        'orb-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.92' },
        },
        'orb-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        'orb-wave': {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.06)' },
          '75%': { transform: 'scale(0.97)' },
        },
        'orb-inner-wave': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.15)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
