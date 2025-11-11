module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'from-emerald-50',
    'via-emerald-100',
    'to-emerald-200',
    'border-emerald-300',
    'text-emerald-900',
    'bg-emerald-500',
    'from-sky-50',
    'via-sky-100',
    'to-sky-200',
    'border-sky-300',
    'text-sky-900',
    'bg-sky-500',
    'from-indigo-50',
    'via-indigo-100',
    'to-indigo-200',
    'border-indigo-300',
    'text-indigo-900',
    'bg-indigo-500',
    'from-amber-50',
    'via-amber-100',
    'to-amber-200',
    'border-amber-300',
    'text-amber-900',
    'bg-amber-500',
    'from-rose-50',
    'via-rose-100',
    'to-rose-200',
    'border-rose-300',
    'text-rose-900',
    'bg-rose-500',
    'from-lime-50',
    'via-lime-100',
    'to-lime-200',
    'border-lime-300',
    'text-lime-900',
    'bg-lime-500',
    'from-orange-50',
    'via-orange-100',
    'to-orange-200',
    'border-orange-300',
    'text-orange-900',
    'bg-orange-500',
    'from-purple-50',
    'via-purple-100',
    'to-purple-200',
    'border-purple-300',
    'text-purple-900',
    'bg-purple-500',
    'from-blue-50',
    'via-blue-100',
    'to-blue-200',
    'border-blue-300',
    'text-blue-900',
    'bg-blue-500',
    'from-fuchsia-50',
    'via-fuchsia-100',
    'to-fuchsia-200',
    'border-fuchsia-300',
    'text-fuchsia-900',
    'bg-fuchsia-500',
    'text-white'
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '80%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' }
        },
        fall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'slide-up': 'slide-up 0.6s ease-out both',
        'bounce-in': 'bounce-in 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        fall: 'fall 1.5s linear forwards'
      }
    }
  },
  plugins: []
};
