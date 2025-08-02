<!-- src/components/MapDisplay.vue -->
<template>
    <div ref="mapContainerRef" class="w-full h-full z-0 bg-gray-200">
        <!-- Map renders here -->
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';

const props = defineProps({
    roundActive: { // Is guessing currently allowed?
        type: Boolean,
        required: true,
    },
    submitted: { // Has the guess for the *current* round been submitted?
        type: Boolean,
        required: true,
    },
    actualLocation: { // { lat, lng } - Provided ONLY after submission
        type: Object,
        default: null,
    },
    guessLocation: { // { lat, lng } - Provided ONLY after submission
        type: Object,
        default: null,
    }
});

const emit = defineEmits(['guess-made']);

const mapContainerRef = ref(null);
let map = null;
let guessMarker = null;
let actualMarker = null;
let resultLine = null;
let currentSettings = {
    showCoordinates: false,
    enableZoom: true,
    darkMode: false
};

function initializeMap() {
    if (!mapContainerRef.value || map) return; // Prevent re-init

    map = L.map(mapContainerRef.value, {
        zoomControl: currentSettings.enableZoom,
        scrollWheelZoom: currentSettings.enableZoom,
        doubleClickZoom: currentSettings.enableZoom,
        touchZoom: currentSettings.enableZoom,
        boxZoom: currentSettings.enableZoom,
    }).setView([20, 0], 2);

    // Use different tile layer based on dark mode setting
    const tileUrl = currentSettings.darkMode ?
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png' :
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 10,
        minZoom: 1
    }).addTo(map);

    // Click listener (only active when round is active)
    map.on('click', handleMapClick);

    // Add coordinates display if enabled
    if (currentSettings.showCoordinates) {
        addCoordinatesDisplay();
    }
}

function handleMapClick(e) {
    // Only allow placing/moving marker if round is active and not yet submitted
    if (props.roundActive && !props.submitted) {
        const coordinates = e.latlng;
        updateGuessMarker(coordinates);
        emit('guess-made', { lat: coordinates.lat, lng: coordinates.lng });
    }
}

function updateGuessMarker(coordinates) {
    if (!map) return;
    if (!guessMarker) {
        // Use a different color/icon for guess marker?
        guessMarker = L.marker(coordinates, { draggable: false }).addTo(map)
            .bindPopup("Your Guess");
    } else {
        guessMarker.setLatLng(coordinates);
    }
    guessMarker.openPopup();
    // Optional: Pan map to marker
    // map.panTo(coordinates);
}

function showResults() {
    if (!map || !props.actualLocation || !props.guessLocation) return;

    // console.log("MapDisplay: Showing results", props.guessLocation, props.actualLocation);

    // Ensure guess marker is at the final guess location
    updateGuessMarker(props.guessLocation);
    if (guessMarker) guessMarker.closePopup(); // Close popup initially

    // Add actual location marker (different style)
    if (!actualMarker) {
        const actualIcon = L.icon({ // Example custom icon
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        actualMarker = L.marker([props.actualLocation.lat, props.actualLocation.lng], { icon: actualIcon }).addTo(map)
            .bindPopup("Actual Location");
    } else {
        actualMarker.setLatLng([props.actualLocation.lat, props.actualLocation.lng]);
    }
    actualMarker.openPopup();

    // Draw line between guess and actual
    if (!resultLine) {
        resultLine = L.polyline([
            [props.guessLocation.lat, props.guessLocation.lng],
            [props.actualLocation.lat, props.actualLocation.lng]
        ], { color: 'red', weight: 3 }).addTo(map);
    } else {
        resultLine.setLatLngs([
            [props.guessLocation.lat, props.guessLocation.lng],
            [props.actualLocation.lat, props.actualLocation.lng]
        ]);
    }

    // Fit map view to show both markers with adequate padding and animation
    map.flyToBounds(L.latLngBounds([
        [props.guessLocation.lat, props.guessLocation.lng],
        [props.actualLocation.lat, props.actualLocation.lng]
    ]), {
        padding: [100, 100],  // More padding for fullscreen view
        duration: 1,          // Animation duration in seconds
        easeLinearity: 0.5    // Smoother animation
    });

    // Force a map resize after a short delay to ensure it fills its container
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 300);
}

function clearMapFeatures() {
    // console.log("MapDisplay: Clearing markers and lines.");
    if (!map) return;
    if (guessMarker) {
        map.removeLayer(guessMarker);
        guessMarker = null;
    }
    if (actualMarker) {
        map.removeLayer(actualMarker);
        actualMarker = null;
    }
    if (resultLine) {
        map.removeLayer(resultLine);
        resultLine = null;
    }
}

function resetMapState() {
    clearMapFeatures();
    if (map) map.flyTo([20, 0], 2); // Reset view gently
}

function updateMapSettings(newSettings) {
    currentSettings = { ...newSettings };

    if (map) {
        // Update zoom controls
        if (newSettings.enableZoom) {
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.touchZoom.enable();
            map.boxZoom.enable();
        } else {
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.touchZoom.disable();
            map.boxZoom.disable();
        }

        // Update tile layer for dark/light theme
        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        const tileUrl = newSettings.darkMode ?
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png' :
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 10,
            minZoom: 1
        }).addTo(map);

        // Add or remove coordinates display
        if (newSettings.showCoordinates) {
            addCoordinatesDisplay();
        } else {
            removeCoordinatesDisplay();
        }
    }
}

let coordinatesControl = null;

function addCoordinatesDisplay() {
    if (coordinatesControl || !map) return;

    coordinatesControl = L.control({ position: 'bottomleft' });
    coordinatesControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'coordinates-display');
        div.style.background = 'rgba(0,0,0,0.8)';
        div.style.color = 'white';
        div.style.padding = '4px 8px';
        div.style.borderRadius = '4px';
        div.style.fontSize = '12px';
        div.style.fontFamily = 'monospace';
        div.innerHTML = 'Lat: 0.000, Lng: 0.000';
        return div;
    };
    coordinatesControl.addTo(map);

    map.on('mousemove', function (e) {
        if (coordinatesControl) {
            const container = coordinatesControl.getContainer();
            if (container) {
                container.innerHTML = `Lat: ${e.latlng.lat.toFixed(3)}, Lng: ${e.latlng.lng.toFixed(3)}`;
            }
        }
    });
}

function removeCoordinatesDisplay() {
    if (coordinatesControl && map) {
        map.removeControl(coordinatesControl);
        coordinatesControl = null;
        map.off('mousemove');
    }
}

// Expose functions for parent components
defineExpose({ resetMapState, updateMapSettings });

function handleResize() {
    if (map) {
        map.invalidateSize();

        // If results are showing, refit bounds
        if (props.submitted && props.actualLocation && props.guessLocation) {
            map.fitBounds(L.latLngBounds([
                [props.guessLocation.lat, props.guessLocation.lng],
                [props.actualLocation.lat, props.actualLocation.lng]
            ]), { padding: [100, 100] });
        }
    }
}

// --- Watchers ---
watch(() => props.submitted, (isSubmitted) => {
    if (isSubmitted && props.actualLocation && props.guessLocation) {
        showResults();
    }
});

// Watch for round becoming active again (implies a new round)
// This might be redundant if parent calls resetMapState explicitly
// watch(() => props.roundActive, (isActive) => {
//     if (isActive) {
//         // If becomes active, assume it's a new round, reset the visuals
//         // Ensure this doesn't clear a marker placed in the *same* active round
//         // Explicit resetMapState call from parent is likely safer
//     }
// });


// --- Lifecycle ---
onMounted(() => {
    // Delay initialization slightly to ensure container is ready
    // requestAnimationFrame or setTimeout can help sometimes
    setTimeout(() => {
        initializeMap();
        // If component mounts into an already submitted state (e.g. page refresh mid-game)
        if (props.submitted && props.actualLocation && props.guessLocation) {
            showResults();
        }

        // Add resize event listener to ensure map fills container after size changes
        window.addEventListener('resize', handleResize);
    }, 50); // Short delay
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (map) {
        map.remove();
        map = null;
    }
});

</script>

<style>
/* Ensure Leaflet's CSS is loaded */
/* @import 'leaflet/dist/leaflet.css'; */

.leaflet-container {
    height: 100%;
    width: 100%;
    background-color: #e5e7eb;
    /* Tailwind gray-200 */
}

.leaflet-control-attribution a {
    /* Improve readability */
    color: #374151;
    /* Tailwind gray-700 */
}
</style>