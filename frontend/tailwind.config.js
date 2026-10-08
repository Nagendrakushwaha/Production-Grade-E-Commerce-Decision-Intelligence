/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#050914',
          card: '#0a1224',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#0f1a33',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'cyan-glow': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'indigo-glow': '0 0 20px -3px rgba(99, 102, 241, 0.3)',
        'emerald-glow': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
