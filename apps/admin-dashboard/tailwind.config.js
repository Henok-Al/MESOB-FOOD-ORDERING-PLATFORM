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
        // FRANK Design System
        frank: {
          orange: '#f97316',
          'orange-dark': '#ea580c',
          'orange-light': '#fb923c',
          green: '#22c55e',
        },
        // Dark theme backgrounds
        dark: {
          primary: '#0a0a0a',
          secondary: '#111111',
          card: '#1a1a1a',
          elevated: '#262626',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#a3a3a3',
          muted: '#737373',
        },
        // Borders
        border: {
          DEFAULT: '#333333',
          light: '#404040',
        },
        // Semantic colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'frank': '12px',
        'frank-lg': '16px',
      },
      boxShadow: {
        'frank': '0 8px 20px rgba(249, 115, 22, 0.25)',
        'frank-lg': '0 20px 40px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}