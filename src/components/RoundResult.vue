<template>
  <div class="round-result">
    <h3 class="text-xl font-bold mb-4">Round {{ result?.roundNumber || currentRound }} Results</h3>
    
    <div class="stats grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="stat bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
        <div class="stat-title text-sm text-gray-500 dark:text-gray-400">Distance</div>
        <div class="stat-value text-xl">{{ formatDistance(result?.distanceKm || 0) }}</div>
      </div>
      
      <div class="stat bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
        <div class="stat-title text-sm text-gray-500 dark:text-gray-400">Score</div>
        <div class="stat-value text-xl">{{ result?.score || 0 }} points</div>
      </div>
    </div>
    
    <div class="mb-6">
      <div class="flex items-center mb-2">
        <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <span class="text-sm">Your guess</span>
      </div>
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <span class="text-sm">Actual location</span>
      </div>
    </div>
    
    <div class="result-map h-72 bg-gray-200 dark:bg-gray-600 rounded-lg mb-6 flex items-center justify-center">
      <p class="text-gray-500 dark:text-gray-400 text-sm">Map preview would go here</p>
    </div>
    
    <div class="text-center" v-if="showNextButton">
      <button 
        @click="$emit('next-round')" 
        class="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
      >
        Next Round
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Define props
const props = defineProps({
  result: {
    type: Object,
    default: () => ({
      roundNumber: 1,
      distanceKm: 0,
      score: 0,
      guessLat: 0,
      guessLng: 0,
      actualLat: 0,
      actualLng: 0
    })
  },
  currentRound: {
    type: Number,
    default: 1
  },
  showNextButton: {
    type: Boolean,
    default: false
  }
});

// Define emits
defineEmits(['next-round']);

// Format distance to be more readable
const formatDistance = (km) => {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  return `${km.toFixed(1)} km`;
};
</script>

<style scoped>
.round-result {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.dark .round-result {
  background-color: #374151;
  color: #e5e7eb;
}
</style> 