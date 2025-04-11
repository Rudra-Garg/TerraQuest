// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // ===>>> ADD THIS CONTENT ARRAY BACK! <<<===
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Scans these files for classes
  ],
  // =========================================
  theme: {
    extend: {
      // Your existing animations/keyframes can stay here
      animation: {
        'portal-pulse': 'portal-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'portal-glow': 'portal-glow 2s ease-in-out infinite',
        'piece-movement': 'piece-movement 2s ease-in-out infinite',
      },
      keyframes: {
        'portal-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'portal-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        'piece-movement': {
          '0%': { transform: 'translate(0, 0)', opacity: '0' },
          '20%': { opacity: '1' },
          '60%': { transform: 'translate(100%, 100%)', opacity: '1' },
          '80%, 100%': { transform: 'translate(100%, 100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}