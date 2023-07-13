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
        'light-home': "url(/panel_light.jpg')",
        'dark-home': "url('/panel_dark.jpg')",
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
          'secondary-content': '#000000',
        },
      },
      {
        dark: {
          ...daisyui['[data-theme=dark]'],
          primary: '#f9575e',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#000000',
        },
      },
    ],
  },
}
