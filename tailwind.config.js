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
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(180, 83, 9, 0.1)' },
          to: { boxShadow: '0 0 24px rgba(180, 83, 9, 0.25)' },
        },
      },
    },
  },
  plugins: [],
};
