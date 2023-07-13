/** @type {import('tailwindcss').Config} */
const daisyui = require('daisyui/src/theming/themes')

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'swap-light': "url('/swap-bg-light.png')",
        'swap-dark': "url('/swap-bg-dark.png')",
        'panel-light': "url('/panel-light.jpg')",
        'panel-dark': "url('/panel-dark.jpg')",
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries'), require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...daisyui['[data-theme=light]'],
          primary: '#f9575e',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#ffffff',
        },
      },
      {
        dark: {
          ...daisyui['[data-theme=dark]'],
          primary: '#f9575e',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#ffffff',
        },
      },
    ],
  },
}
