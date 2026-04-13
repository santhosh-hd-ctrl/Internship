/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50:  '#f0f0f5',
          100: '#e0e0eb',
          200: '#c0c0d6',
          300: '#9090b8',
          400: '#606099',
          500: '#30306b',
          600: '#1a1a3e',
          700: '#12122e',
          800: '#0d0d22',
          900: '#080815',
          950: '#040409',
        },
        accent: {
          DEFAULT: '#7c5cbf',
          light:   '#9b7dd4',
          dark:    '#5a3d9a',
          glow:    '#7c5cbf40',
        },
        surface: {
          DEFAULT: '#141428',
          hover:   '#1c1c38',
          active:  '#22224a',
          border:  '#2a2a50',
        },
        message: {
          sent:     '#3b2d6b',
          received: '#1c1c38',
        },
        online:  '#22c55e',
        offline: '#6b7280',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow:    '0 0 20px rgba(124,92,191,0.3)',
        'glow-lg': '0 0 40px rgba(124,92,191,0.4)',
        glass:   '0 8px 32px rgba(0,0,0,0.4)',
        card:    '0 4px 24px rgba(0,0,0,0.3)',
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-dot':    'pulseDot 1.5s ease-in-out infinite',
        'typing':       'typing 1.2s ease-in-out infinite',
        'bounce-in':    'bounceIn 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'shimmer':      'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:        { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:       { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight:  { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot:      { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.3)', opacity: 0.7 } },
        typing:        { '0%,60%,100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-6px)' } },
        bounceIn:      { from: { opacity: 0, transform: 'scale(0.8)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:       { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
