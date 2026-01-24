import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#021a1a', // Deep teal-dark background
        card: 'rgba(13, 46, 46, 0.6)', // Transparent teal for glassmorphism
        primary: '#14b8a6', // Teal 500
        'primary-light': '#2dd4bf', // Teal 400
        'primary-dark': '#0d9488', // Teal 600
        'status-free': '#10b981', // Emerald 500
        'status-occupied': '#ef4444', // Red 500 - kept
        'status-reserved': '#f59e0b', // Amber 500 - kept
        'status-offline': '#475569', // Slate 600
      },
    },
  },
  plugins: [],
}
export default config
