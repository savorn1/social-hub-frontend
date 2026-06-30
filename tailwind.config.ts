import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{vue,ts,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        /* Cards */
        'card':    '0 1px 4px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 6px 20px -2px rgba(0,0,0,0.09), 0 2px 6px -2px rgba(0,0,0,0.05)',
        'card-lg': '0 12px 32px -4px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.07)',
        /* Dialogs / Modals */
        'dialog':  '0 24px 64px -8px rgba(0,0,0,0.18), 0 10px 24px -4px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(0,0,0,0.06)',
        /* Navigation */
        'sidebar': '2px 0 20px -4px rgba(0,0,0,0.08)',
        'topbar':  '0 1px 0 0 rgba(0,0,0,0.07), 0 4px 12px -2px rgba(0,0,0,0.04)',
        /* Buttons */
        'btn-blue':       '0 1px 4px 0 rgba(37,99,235,0.28), 0 1px 2px -1px rgba(37,99,235,0.15)',
        'btn-blue-hover': '0 4px 12px -1px rgba(37,99,235,0.35), 0 2px 4px -2px rgba(37,99,235,0.20)',
        'btn-red':        '0 1px 4px 0 rgba(220,38,38,0.25), 0 1px 2px -1px rgba(220,38,38,0.15)',
        'btn-red-hover':  '0 4px 12px -1px rgba(220,38,38,0.30), 0 2px 4px -2px rgba(220,38,38,0.18)',
        /* Nav active pill */
        'nav-active': '0 2px 8px 0 rgba(37,99,235,0.22)',
      },
    },
  },
  plugins: [],
} satisfies Config
