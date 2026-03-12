<template>
    <div class="p-6 bg-[#111117] border border-white/[0.08] rounded-2xl">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-5">
            <span
                class="text-[10px] font-medium text-[#D36040] uppercase tracking-[0.2em]"
            >
                Round {{ result?.roundNumber || currentRound }}
            </span>
            <span class="h-px flex-1 bg-white/[0.06]"></span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-6">
            <!-- Distance -->
            <div
                class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
            >
                <p
                    class="text-[10px] text-white/30 uppercase tracking-widest mb-1.5"
                >
                    Distance
                </p>
                <p class="text-2xl font-light text-[#D36040] tabular-nums">
                    {{ formatDistance(result?.distanceKm || 0) }}
                </p>
            </div>

            <!-- Score -->
            <div
                class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
            >
                <p
                    class="text-[10px] text-white/30 uppercase tracking-widest mb-1.5"
                >
                    Score
                </p>
                <p class="text-2xl font-light text-white tabular-nums">
                    {{ (result?.score || 0).toLocaleString() }}
                    <span class="text-sm text-white/30 font-normal">pts</span>
                </p>
            </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-5 mb-4">
            <div class="flex items-center gap-2">
                <span
                    class="w-3 h-3 rounded-full bg-[#D36040] flex-shrink-0"
                ></span>
                <span class="text-xs text-white/40">Your guess</span>
            </div>
            <div class="flex items-center gap-2">
                <span
                    class="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0"
                ></span>
                <span class="text-xs text-white/40">Actual location</span>
            </div>
        </div>

        <!-- Map placeholder -->
        <div
            class="h-52 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-6 flex items-center justify-center"
        >
            <div class="flex flex-col items-center gap-2 text-white/20">
                <svg
                    class="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                </svg>
                <span class="text-xs tracking-wider">Map preview</span>
            </div>
        </div>

        <!-- Next Round Button -->
        <div v-if="showNextButton" class="flex justify-center">
            <button
                @click="$emit('next-round')"
                class="inline-flex items-center gap-2.5 px-8 py-3 bg-[#D36040] hover:bg-[#b04a2e] text-white font-medium rounded-full transition-all text-sm shadow-lg shadow-[#D36040]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
                Next Round
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    result: {
        type: Object,
        default: () => ({
            roundNumber: 1,
            distanceKm: 0,
            score: 0,
            guessLat: 0,
            guessLng: 0,
            actualLat: 0,
            actualLng: 0,
        }),
    },
    currentRound: {
        type: Number,
        default: 1,
    },
    showNextButton: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["next-round"]);

function formatDistance(km) {
    if (km < 1) return `${(km * 1000).toFixed(0)} m`;
    return `${km.toFixed(1)} km`;
}
</script>
