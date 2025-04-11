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
  // Optional: Add Autoprefixer if needed, though @tailwindcss/vite should handle it
  // css: {
  //   postcss: {
  //     plugins: [autoprefixer()], // Usually not needed with @tailwindcss/vite
  //   },
  // },
  build: {
    outDir: 'dist',
  }
})