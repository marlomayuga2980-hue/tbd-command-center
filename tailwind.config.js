/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'tbd-blue':   '#1E4DB7',
        'tbd-deep':   '#0F3A8F',
        'tbd-orange': '#E8743E',
        'tbd-bg':     '#060E1F',
        success:      '#10B981',
        warning:      '#F59E0B',
        danger:       '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'status-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.7)' },
        },
        'glow-fade': {
          '0%':   { boxShadow: '0 0 12px 4px rgba(239,68,68,0.7)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
      },
      animation: {
        'status-pulse': 'status-pulse 2s ease-in-out infinite',
        'glow-fade':    'glow-fade 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
};

