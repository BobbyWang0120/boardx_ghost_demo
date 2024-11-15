/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./**.hbs",
        "./**/*.hbs"
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: null,
                        color: '#1a1a1a',
                        a: {
                            color: '#1a1a1a',
                            textDecoration: 'underline',
                            textDecorationColor: '#d1d5db',
                            textUnderlineOffset: '2px',
                            '&:hover': {
                                color: '#4b5563',
                            },
                        },
                        blockquote: {
                            borderLeftColor: '#1a1a1a',
                            color: '#1a1a1a',
                            fontStyle: 'normal',
                            quotes: '"\\201C""\\201D""\\2018""\\2019"',
                        },
                        'code::before': {
                            content: '""',
                        },
                        'code::after': {
                            content: '""',
                        },
                        code: {
                            color: '#1a1a1a',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.375rem',
                        },
                        'pre code': {
                            backgroundColor: 'transparent',
                            borderWidth: '0',
                            borderRadius: '0',
                            padding: '0',
                            color: 'inherit',
                        },
                        hr: {
                            borderColor: '#e5e7eb',
                            marginTop: '3em',
                            marginBottom: '3em',
                        },
                    },
                },
                lg: {
                    css: {
                        h1: {
                            fontSize: '2.5rem',
                        },
                        h2: {
                            fontSize: '2rem',
                        },
                        h3: {
                            fontSize: '1.75rem',
                        },
                    },
                },
            },
            fontFamily: {
                sans: [
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Arial',
                    'sans-serif',
                ],
            },
            aspectRatio: {
                'card': '3/4',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
