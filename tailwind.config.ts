import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-base)',
        surface: 'var(--surface)',
        elevated: 'var(--surface-elevated)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent-class': 'var(--accent-class)',
        'accent-demo': 'var(--accent-demo)',
        'accent-task': 'var(--accent-task)',
        'accent-danger': 'var(--accent-danger)'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12)',
        glow: '0 0 0 1px rgba(91, 95, 249, 0.2), 0 18px 60px rgba(91, 95, 249, 0.22)'
      },
      borderRadius: {
        md: '14px',
        lg: '20px',
        xl: '28px'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
