// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,js,jsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        navy: {
          dark:  '#0A0F1E',
          mid:   '#111827',
          light: '#1E2A3A',
        },
        electric: '#3B82F6',
        'blue-glow': '#60A5FA',
        cyan: '#06B6D4',
        gold: '#F59E0B',
        'fm-red': '#EF4444',
        'fm-green': '#10B981',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.4)',
        'glow-gold': '0 0 20px rgba(245,158,11,0.35)',
        'card':      '0 4px 24px rgba(0,0,0,0.12)',
        'card-hover':'0 8px 40px rgba(59,130,246,0.2)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease forwards',
        'bounce-cart':'bounceCart 0.4s ease',
        'float':       'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:      { '0%': { opacity:'0', transform:'translateY(24px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        fadeIn:      { '0%': { opacity:'0' },                               '100%': { opacity:'1' } },
        pulseGlow:   { '0%,100%': { boxShadow:'0 0 10px rgba(59,130,246,0.3)' }, '50%': { boxShadow:'0 0 28px rgba(59,130,246,0.7)' } },
        slideIn:     { '0%': { opacity:'0', transform:'translateX(-16px)' }, '100%': { opacity:'1', transform:'translateX(0)' } },
        bounceCart:  { '0%,100%': { transform:'scale(1)' }, '50%': { transform:'scale(1.3)' } },
        float:        { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
