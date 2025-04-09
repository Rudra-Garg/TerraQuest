<template>
  <div id="app-container" class="min-h-screen bg-gray-100">
    <!-- Basic Navbar Example -->
    <nav class="bg-blue-600 p-4 text-white">
      <router-link to="/" class="mr-4 hover:text-blue-200">Home</router-link>
      <router-link to="/game" class="mr-4 hover:text-blue-200">New Game</router-link>
      <!-- Add other links later -->
    </nav>

    <!-- Main content area where views will be rendered -->
    <main class="container mx-auto p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Root component logic if needed
</script>

<style>
/* Add Leaflet's CSS - alternative place if not in style.css */
/* @import 'leaflet/dist/leaflet.css'; */

/* Ensure map containers have a defined height */
.leaflet-container {
   height: 400px; /* Or set dynamically */
   width: 100%;
}
</style>