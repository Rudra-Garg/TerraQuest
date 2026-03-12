// src/main.js (updated)
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router' // Import the router
import './style.css'
import '@fontsource/playfair-display/400-italic.css' // Import Playfair Display Italic
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router) // Use the router

app.mount('#app')