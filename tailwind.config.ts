import type { Config } from 'tailwindcss';

export default {
  content: [
    './content/**/*.{md,html}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        'bg-light': '#f2f2f2',
        'text-light': '#1b1d36',
        'link-light': '#0066cc',
        'code-bg-light': '#1b1d36',
        'code-text-light': '#f2f2f2',
        'blockquote-light': '#d72638',
        'visited-light': '#551a8b',
        'input-bg-light': '#fff',
        'input-text-light': '#1b1d36',
        'accent-light': '#ffd400',

        // Dark mode colors
        'bg-dark': '#1b1d36',
        'text-dark': '#f2f2f2',
        'link-dark': '#ffd400',
        'code-bg-dark': '#d72638',
        'code-text-dark': '#f2f2f2',
        'blockquote-dark': '#ffd400',
        'visited-dark': '#d72638',
        'input-bg-dark': '#1e96fc',
        'input-text-dark': '#f2f2f2',
        'accent-dark': '#ffd400',

        // Semantic color mappings
        bg: {
          light: '#f2f2f2',
          dark: '#1b1d36',
        },
        text: {
          light: '#1b1d36',
          dark: '#f2f2f2',
        },
        link: {
          light: '#0066cc',
          dark: '#ffd400',
        },
        'code-bg': {
          light: '#1b1d36',
          dark: '#d72638',
        },
        'code-text': {
          light: '#f2f2f2',
          dark: '#f2f2f2',
        },
        blockquote: {
          light: '#d72638',
          dark: '#ffd400',
        },
        'visited-link': {
          light: '#551a8b',
          dark: '#d72638',
        },
        'input-bg': {
          light: '#fff',
          dark: '#1e96fc',
        },
        'input-text': {
          light: '#1b1d36',
          dark: '#f2f2f2',
        },
        accent: {
          light: '#ffd400',
          dark: '#ffd400',
        },
      },
      fontFamily: {
        'noto-sans': ['Noto Sans', 'sans-serif'],
        'jersey': ['Jersey 25', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
