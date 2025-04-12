// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // Correct import

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss() // Correctly added plugin instance
  ],
  base: '/', 
  build: {
    outDir: 'dist',
  }
})