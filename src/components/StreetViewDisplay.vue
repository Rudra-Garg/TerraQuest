<!-- src/components/StreetViewDisplay.vue -->
<template>
  <div ref="panoRef" class="w-full h-[50vh] bg-gray-300">
    Street View will load here...
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  location: { // Expect an object like { lat: Number, lng: Number }
    type: Object,
    required: true
  }
});

const panoRef = ref(null);
let panorama = null;

function initializeStreetView() {
  if (!panoRef.value || !window.google || !window.google.maps) {
    console.error("Street View container or Google Maps API not ready.");
    // Optionally retry after a short delay
    // setTimeout(initializeStreetView, 200);
    return;
  }
  if (!props.location || typeof props.location.lat !== 'number' || typeof props.location.lng !== 'number') {
      console.warn("Invalid location prop for StreetView:", props.location);
      return; // Don't initialize if location isn't valid yet
  }

  panorama = new google.maps.StreetViewPanorama(
    panoRef.value, {
      position: { lat: props.location.lat, lng: props.location.lng },
      pov: { heading: 34, pitch: 10 },
      zoom: 1,
      addressControl: false,
      linksControl: true, // Allow navigation
      panControl: true,
      enableCloseButton: false,
      fullscreenControl: false,
      motionTracking: false, // Disable mobile motion tracking unless desired
      motionTrackingControl: false,
    }
  );
}

onMounted(() => {
  // Check if Google Maps API is loaded before initializing
  if (window.google && window.google.maps) {
    initializeStreetView();
  } else {
    // If Maps API isn't loaded yet (e.g., script loaded async after component mount)
    // A more robust solution might involve an event listener or a global flag
    console.warn("Google Maps API not ready on mount, will try again on location change.");
  }
});

// Watch for changes in the location prop to update Street View
watch(() => props.location, (newLocation) => {
  if (panorama && newLocation) {
    panorama.setPosition({ lat: newLocation.lat, lng: newLocation.lng });
    console.log("Street View position updated:", newLocation);
  } else if (!panorama && newLocation) {
      // Attempt to initialize if it failed on mount but we now have a location
      initializeStreetView();
  }
}, { deep: true }); // Use deep watch if location object might be mutated

</script>

<style scoped>
/* Scoped styles if needed */
.h-\[50vh\] { /* Ensure Tailwind recognizes this class if needed */
    height: 50vh;
}
</style>