/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#05091A',
        card:     '#0B1225',
        card2:    '#111B32',
        border:   '#1C2A45',
        green:    '#00D463',
        gold:     '#FFD600',
        red:      '#FF3B30',
        muted:    '#6B84A8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
