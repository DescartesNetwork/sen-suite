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
        'home': "url('/home-bg.png')",
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
          'secondary-content': '#000',
          'neutral-focus': '#212433',

          '--accent': '#2B3440',
          '--accent-content': '#ffffff',
          '--opaline': '#ffffffb3',
          '--opaline-content': "#000"
        },
      },
      {
        dark: {
          ...daisyui['[data-theme=dark]'],
          primary: '#f9575e',
          'primary-content': '#ffffff',
          secondary: '#5d6ccf',
          'secondary-content': '#ffffff',
          'neutral-focus': '#A6ACBA',

          '--accent': '#F4F4F5',
          '--accent-content': '#212433',
          '--opaline': '#ffffffb3',
          '--opaline-content': "#F4F4F5"
        },
      },
    ],
  },
}
