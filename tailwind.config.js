/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#F7F8F0',   // off-white cálido (P3)
        card:     '#FFFFFF',   // blanco puro — tarjetas
        card2:    '#DFF1F1',   // mint teal (P1) — superficies secundarias
        border:   '#BBD5DA',   // teal apagado (P1) — bordes
        blue:     '#3674B5',   // azul broadcast (P2) — acento principal
        ice:      '#578FCA',   // azul claro (P2) — barras / secundario
        green:    '#0A6E35',   // verde oscuro — México
        gold:     '#A07808',   // ámbar oscuro legible (derivado P2 FADA7A)
        'gold-lt':'#FADA7A',   // gold claro (P2) — fills decorativos
        red:      '#FF0000',   // rojo puro (P1) — EN VIVO
        muted:    '#4A6E8A',   // azul-gris medio (P3) — texto apagado
        text:     '#1C2E42',   // navy oscuro (derivado P3) — texto principal
      },
      fontFamily: {
        mono:    ['IBM Plex Mono', 'monospace'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
