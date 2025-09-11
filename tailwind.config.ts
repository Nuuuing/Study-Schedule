import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,jsx,ts,tsx}',
        './src/app/**/*.{js,jsx,ts,tsx}',
        './src/components/**/*.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // 테마 1                 
                't1-background': '#F4F1ED',
                't1-text'      : '#4E423D',
                't1-primary'   : '#B09B8C',
                't1-secondary' : '#EADDCD',
                't1-accent'    : '#C58940',
                't1-card'      : '#FFFFFF',                
                
                // 테마 2 
                't2-background': '#EFF7F6',
                't2-text'      : '#0B4F6C',
                't2-primary'   : '#74B3CE',
                't2-secondary' : '#A2D2FF',
                't2-accent'    : '#F9C80E',
                't2-card'      : '#FFFFFF',
                
                // 테마 3 
                't3-background': '#fdf2ffff',
                't3-text': '#483D8B',
                't3-primary': '#E6E6FA',
                't3-secondary': '#fdfd96',
                't3-accent': '#F5DEB3',
                't3-card': '#ffdbec',

                //테마 4 -- 다크            
                't4-background': '#16161A',
                't4-text'      : '#E1E1E1',
                't4-primary'   : '#242629',
                't4-secondary' : '#94A1B2',
                't4-accent'    : '#2CB67D',
                't4-card'      : '#2E2F33',

            },
            fontFamily: {
                sans: ['Moneygraphy-Pixel', 'sans-serif'],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.2s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                'slide-down': 'slide-down 0.2s ease-out',
            },
        },
    },
    plugins: [],
};

export default config;