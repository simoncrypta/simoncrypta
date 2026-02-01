import type { Config } from 'tailwindcss';

export default {
  content: [
    './content/**/*.{md,html}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        'noto-sans': ['Noto Sans', 'sans-serif'],
        'jersey': ['Jersey 25', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
