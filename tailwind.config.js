/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0D0D14',
        deep: '#13131E',
        surface: '#1A1A2A',
        'surface-2': '#1E1E30',
        gold: {
          DEFAULT: '#C9A84C',
          soft: '#D4B96A',
          dim: 'rgba(201,168,76,0.12)',
          glow: 'rgba(201,168,76,0.25)',
        },
        cream: '#F5EFE0',
        danger: '#C0524A',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cinzel', 'serif'],
      },
      animation: {
        'orb-breathe': 'orbBreathe 5s ease-in-out infinite',
        'orb-pulse': 'orbPulse 1.5s ease-in-out infinite',
        'orb-listen': 'orbListen 2s ease-in-out infinite',
        'orb-speak': 'orbSpeak 0.8s ease-in-out infinite',
        'orb-think': 'orbThink 3s ease-in-out infinite',
        'ring-pulse': 'ringPulse 3s ease-in-out infinite',
        'ring-spin': 'ringSpin 3s linear infinite',
        'mode-pulse': 'modePulse 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1.2s ease-in-out infinite',
        'msg-in': 'msgIn 0.4s ease forwards',
      },
      keyframes: {
        orbBreathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        orbPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        orbListen: {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.04)' },
          '60%': { transform: 'scale(0.98)' },
        },
        orbSpeak: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.06)' },
          '75%': { transform: 'scale(0.97)' },
        },
        orbThink: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '33%': { transform: 'scale(1.02) rotate(1deg)' },
          '66%': { transform: 'scale(0.99) rotate(-1deg)' },
        },
        ringPulse: {
          '0%, 100%': { transform: 'translate(-50%,-50%) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translate(-50%,-50%) scale(1.06)', opacity: '0.3' },
        },
        ringSpin: {
          from: { transform: 'translate(-50%,-50%) rotate(0deg)' },
          to: { transform: 'translate(-50%,-50%) rotate(360deg)' },
        },
        modePulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        typingDot: {
          '0%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(-3px)' },
        },
        msgIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
