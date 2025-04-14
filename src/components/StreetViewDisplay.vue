<!-- src/components/StreetViewDisplay.vue -->
<template>
  <!-- REMOVED h-[50vh] class here, parent controls size -->
  <div ref="panoRef" class="w-full h-full bg-gray-300">
    <!-- Added loading/error state placeholder -->
    <div v-if="isLoading" class="flex items-center justify-center h-full text-gray-500">Initializing Street View...</div>
     <div v-if="loadError" class="flex items-center justify-center h-full text-red-500 p-4 text-center">Street View not available for this location.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'; // Added nextTick

const props = defineProps({
  location: { // Expect an object like { lat: Number, lng: Number } or null
    type: Object,
    default: null,
    // Make required false if it can be null initially before game starts
    // required: true
  }
});

const panoRef = ref(null);
let panorama = null; // The StreetViewPanorama instance
let service = null;  // The StreetViewService instance
const isLoading = ref(false);
const loadError = ref(false);
let observer = null; // ResizeObserver
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

// --- Core Initialization/Update Logic ---
async function setupStreetView() {
    // 0. Reset state
    isLoading.value = true;
    loadError.value = false;
    initAttempts = 0;
    // console.log("StreetView: Attempting setup for", props.location);

    // 1. Wait for DOM element and valid location prop
    if (!panoRef.value || !props.location || typeof props.location.lat !== 'number') {
        // console.warn("StreetView: Setup aborted - Container or location invalid.", { el: !!panoRef.value, loc: props.location });
        isLoading.value = false;
        // Don't set loadError yet, might just be waiting for props
        return;
    }

    // 2. Wait for Google Maps API (with retry)
    if (!(await ensureMapsApiReady(100))) { // Wait up to 100ms initially
        // console.error("StreetView: Google Maps API did not become ready.");
        isLoading.value = false;
        loadError.value = true; // Set error if API never loads
        return;
    }

    // 3. Initialize Service if needed
    if (!service) {
        service = new google.maps.StreetViewService();
    }

    // 4. Check Panorama Availability
    service.getPanorama(
        { location: props.location, radius: 50, source: google.maps.StreetViewSource.OUTDOOR },
        handlePanoramaCheckResult
    );
}

function handlePanoramaCheckResult(data, status) {
    if (status === google.maps.StreetViewStatus.OK) {
        // // console.log("StreetView: Panorama found via Service. Proceeding to display.");
        displayPanorama(data.location.pano); // Pass Pano ID
    } else {
        console.error(`StreetView: Panorama check failed for location ${JSON.stringify(props.location)} - Status: ${status}`);
        isLoading.value = false;
        loadError.value = true;
        if (panorama) panorama.setVisible(false);
        // Optional: Trigger something in parent to get a new location?
    }
}

function displayPanorama(panoId) {
     if (!panoRef.value || !window.google || !window.google.maps) {
         console.error("StreetView: Cannot display panorama, context lost.");
         isLoading.value = false;
         loadError.value = true;
         return;
     }

     if (!panorama) {
        // Create panorama instance ONLY if it doesn't exist
        // console.log("StreetView: Creating new Panorama instance.");
        panorama = new google.maps.StreetViewPanorama(
            panoRef.value, {
                pov: { heading: 34, pitch: 10 }, // Default starting view
                zoom: 0, // Start slightly zoomed out

                addressControl: false,      // <<< HIDE address text
                linksControl: true,         // <<< HIDE navigation arrows
                panControl: true,           // Keep pan control (mouse drag)
                zoomControl: false,         // <<< HIDE zoom buttons
                scrollwheel: true,         // Allow zooming with scroll
                clickToGo: true,           // <<< DISABLE double-click to move

                enableCloseButton: false,    // Should already be false
                fullscreenControl: false,   // <<< HIDE fullscreen button
                motionTracking: false,       // Usually off for desktop
                motionTrackingControl: false,
                showRoadLabels: false
            }
        );
        setupResizeObserver(); // Set up observer when instance is created
     }

    // Set the specific panorama
    // console.log(`StreetView: Setting pano ID: ${panoId}`);
    panorama.setPano(panoId);
    // Set POV *after* setting pano might be more reliable
    panorama.setPov({ heading: 34, pitch: 10 });
    panorama.setVisible(true);

    isLoading.value = false;
    loadError.value = false;
}


// --- Helper Functions ---
async function ensureMapsApiReady(initialDelay = 0, retryDelay = 50, maxRetries = 5) {
    if (window.google && window.google.maps) return true;

    if (initialDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
        if (window.google && window.google.maps) return true;
    }

    for (let i = 0; i < maxRetries; i++) {
        console.warn(`StreetView: Maps API not ready, retrying (${i+1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        if (window.google && window.google.maps) return true;
    }
    return false;
}

function setupResizeObserver() {
    if (!panoRef.value || observer) return; // Don't setup if no element or already observing
    observer = new ResizeObserver(() => {
        if (panorama && window.google && window.google.maps) {
            // Use nextTick to ensure DOM updates are flushed before triggering resize
            nextTick(() => {
                google.maps.event.trigger(panorama, 'resize');
                 // console.log("StreetView: Triggered resize."); // Debug logging
            });
        }
    });
    observer.observe(panoRef.value);
    // console.log("StreetView: Resize observer attached.");
}

function disconnectObserver() {
     if (observer && panoRef.value) {
        observer.unobserve(panoRef.value);
        // console.log("StreetView: Resize observer detached.");
     }
     observer = null;
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  // console.log("StreetView: Mounted.");
  // Wait briefly for component to settle and API script loading (started in App.vue) to potentially complete
  await nextTick(); // Wait for Vue's next DOM update cycle
  // Don't initialize immediately, wait for the location prop watch to trigger the first setup
  // setupStreetView(); // Let the watcher handle the first valid location
});

onUnmounted(() => {
  // console.log("StreetView: Unmounted.");
  disconnectObserver();
  // Clean up panorama instance? Should be garbage collected, but can be explicit:
  if (panorama && panorama.setVisible) {
      panorama.setVisible(false);
  }
  panorama = null;
  service = null;
});

// --- Watchers ---
watch(() => props.location, async (newLocation, oldLocation) => {
    // Use nextTick to ensure the DOM (panoRef) is definitely ready after prop change causes re-render
    await nextTick();

    if (newLocation && (!oldLocation || newLocation.lat !== oldLocation.lat || newLocation.lng !== oldLocation.lng)) {
        // console.log("StreetView: Location prop changed.", { new: newLocation });
        // Always attempt a fresh setup when location fundamentally changes
        await setupStreetView();

    } else if (!newLocation && panorama) {
        // If location becomes null, hide the panorama
        // console.log("StreetView: Location became null, hiding panorama.");
        isLoading.value = false;
        loadError.value = false;
        panorama.setVisible(false);
    }
}, { deep: true, immediate: true }); // Use immediate: true to run watcher on mount if prop starts non-null

</script>

<style scoped>
/* Parent controls size via flex */
</style>