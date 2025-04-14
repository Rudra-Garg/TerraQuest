// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  base: process.env.NODE_ENV === 'production' ? '/geoguessr/' : '/', // Update base URL for GitHub Pages
  build: {
    outDir: 'dist',
  }
})