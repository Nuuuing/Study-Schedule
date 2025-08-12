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
                background: {
                    light: '#ffffff',
                    dark: '#141414',
                },
                text: {
                    light: '#151515',
                    dark: '#f3f3f3',
                },
                primary: {
                    light: '#151515',
                    dark: '#f3f3f3',
                },
            },
            fontFamily: {
                sans: ['Paperlogy', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;