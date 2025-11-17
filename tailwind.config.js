import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d4ed8',
          light: '#2563eb',
          dark: '#1e3a8a',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
      },
    },
  },
  plugins: [forms],
};

