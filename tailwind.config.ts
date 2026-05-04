import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'oklch(0.55 0.18 245)',
          light: 'oklch(0.97 0.04 245)',
          dark:  'oklch(0.35 0.18 245)',
        },
        sidebar: '#0d1117',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        sans:  ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
