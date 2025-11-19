/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aura color palette
        aura: {
          red: '#FF4B5C',
          orange: '#FFAD69',
          yellow: '#FFFB7D',
          green: '#75F7AE',
          blue: '#6EC1E4',
          purple: '#C77DFF',
          pink: '#FCBAD3',
          white: '#F2F2F2',
        },
        // Primary brand colors (teal/cyan)
        primary: '#06B6D4',
        secondary: '#22D3EE',
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'aura': '0 0 20px rgba(199, 125, 255, 0.3)',
        'aura-lg': '0 0 40px rgba(199, 125, 255, 0.4)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
    },
  },
  plugins: [],
};
