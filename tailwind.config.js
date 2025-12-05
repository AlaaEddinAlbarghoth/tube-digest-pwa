/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#135bec',
                    50: '#e6f0ff',
                    100: '#cce1ff',
                    200: '#99c3ff',
                    300: '#66a5ff',
                    400: '#3387ff',
                    500: '#135bec',
                    600: '#0f4abd',
                    700: '#0b388e',
                    800: '#07265f',
                    900: '#041330',
                },
                dark: {
                    DEFAULT: '#101622',
                    50: '#f6f7f9',
                    100: '#e8eaee',
                    200: '#d1d5dd',
                    300: '#a8b0c1',
                    400: '#7a849f',
                    500: '#5a6484',
                    600: '#48506b',
                    700: '#3b4157',
                    800: '#2e3546',
                    850: '#1f2431',
                    900: '#101622',
                },
                light: {
                    DEFAULT: '#f6f6f8',
                    50: '#ffffff',
                    100: '#f6f6f8',
                    200: '#ececf0',
                    300: '#d9d9e0',
                    400: '#c6c6d0',
                    500: '#b3b3c0',
                }
            },
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'card': '16px',
                'button': '12px',
                'chip': '20px',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
                'dark-card': '0 2px 8px rgba(0, 0, 0, 0.3)',
                'dark-card-hover': '0 4px 16px rgba(0, 0, 0, 0.4)',
            }
        },
    },
    plugins: [],
}
