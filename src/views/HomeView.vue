<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
      Welcome to GeoCloner!
    </h1>
    <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
      Explore the world from random Street View locations. Pinpoint your position on the map and see how close you can get!
    </p>
    <router-link
      to="/game"
      class="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 text-xl font-semibold transition duration-150 ease-in-out transform hover:scale-105"
    >
      Start Exploring
    </router-link>
  </div>
</template>

<script setup>
// No specific logic needed for this simple home page yet
</script>

<style scoped>
/* Add any specific styles if needed */
</style>