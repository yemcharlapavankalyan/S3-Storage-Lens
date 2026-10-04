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
          bg: '#080C14',
          canvas: '#0B0F19',
          surface: '#111827',
          card: '#131B2E',
          cardHover: '#18223B',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
          muted: '#94A3B8',
        },
        aws: {
          orange: '#FF9900',
          squid: '#232F3E',
          amber: '#F59E0B',
          hover: '#EC7211',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          emerald: '#10B981',
        },
        storage: {
          standard: '#3B82F6',
          ia: '#F59E0B',
          intelligent: '#8B5CF6',
          glacier: '#06B6D4',
          deep: '#64748B',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        display: [
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'Menlo',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        glow: '0 0 25px -5px rgba(245, 158, 11, 0.15)',
        glowSm: '0 0 15px -3px rgba(245, 158, 11, 0.2)',
        emeraldGlow: '0 0 20px -5px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
