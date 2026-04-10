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
        pablo: {
          black: 'var(--color-bg-primary)',
          dark: 'var(--color-bg-secondary)',
          panel: 'var(--color-bg-panel)',
          'bg-input': 'var(--color-bg-input)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          muted: 'var(--color-text-muted)',
          text: 'var(--color-text-secondary)',
          light: 'var(--color-text-primary)',
          green: 'var(--color-accent-green)',
          'green-dim': 'var(--color-accent-green-dim)',
          gold: 'var(--color-accent-gold)',
          'gold-dim': 'var(--color-accent-gold-dim)',
          red: 'var(--color-accent-red)',
          'red-bright': 'var(--color-accent-red-bright)',
          'red-dim': 'var(--color-accent-red-dim)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flicker': 'flicker 0.15s infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'typewriter': 'typewriter 2s steps(20) forwards',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px var(--color-accent-green-glow-1), 0 0 10px var(--color-accent-green-glow-2)' },
          '100%': { textShadow: '0 0 10px var(--color-accent-green-glow-3), 0 0 20px var(--color-accent-green-glow-4), 0 0 30px var(--color-accent-green-glow-5)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}
