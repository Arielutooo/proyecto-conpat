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
          DEFAULT: '#C84632',
          hover:   '#B53C2A',
          light:   '#FFF0EC',
          border:  '#F4C5B5',
          dark:    '#8B3020',
        },
        sidebar:    '#363E46',
        'cp-gray':  '#464C5E',
        'cp-pearl': '#EDEEF1',
        'cp-alabaster': '#F3F3EB',
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
