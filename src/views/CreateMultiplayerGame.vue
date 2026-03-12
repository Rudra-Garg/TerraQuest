<template>
    <div
        class="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-24 relative overflow-hidden"
    >
        <!-- Background dot pattern -->
        <div
            class="absolute inset-0 opacity-[0.025] pointer-events-none"
            style="
                background-image: radial-gradient(
                    rgba(255, 255, 255, 0.8) 1px,
                    transparent 1px
                );
                background-size: 28px 28px;
            "
        ></div>

        <!-- Ambient glow -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D36040]/4 rounded-full blur-[140px] pointer-events-none"
        ></div>

        <div class="relative z-10 w-full max-w-md">
            <!-- Header -->
            <div class="mb-8 text-center">
                <div
                    class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#D36040]/10 border border-[#D36040]/20 mb-5"
                >
                    <svg
                        class="w-6 h-6 text-[#D36040]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
                <h1 class="text-2xl font-semibold text-white tracking-tight">
                    Host a Game
                </h1>
                <p class="text-sm text-white/35 mt-1.5">
                    Configure your room and share the code with friends.
                </p>
            </div>

            <!-- Card -->
            <div
                class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
                <form @submit.prevent="handleCreateGame" class="space-y-5">
                    <!-- Max Players -->
                    <div class="space-y-1.5">
                        <label
                            for="maxPlayers"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                        >
                            Max Players
                        </label>
                        <div class="relative">
                            <select
                                v-model="maxPlayers"
                                id="maxPlayers"
                                class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all"
                            >
                                <option
                                    v-for="n in [2, 3, 4, 5, 6, 8]"
                                    :key="n"
                                    :value="n"
                                    class="bg-[#111117] text-white"
                                >
                                    {{ n }} Players
                                </option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5"
                            >
                                <svg
                                    class="w-4 h-4 text-white/30"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Rounds -->
                    <div class="space-y-1.5">
                        <label
                            for="roundsTotal"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                        >
                            Number of Rounds
                        </label>
                        <div class="relative">
                            <select
                                v-model="roundsTotal"
                                id="roundsTotal"
                                class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all"
                            >
                                <option
                                    v-for="n in [3, 5, 7, 10]"
                                    :key="n"
                                    :value="n"
                                    class="bg-[#111117] text-white"
                                >
                                    {{ n }} Rounds
                                </option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5"
                            >
                                <svg
                                    class="w-4 h-4 text-white/30"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Round Duration -->
                    <div class="space-y-1.5">
                        <label
                            for="roundDuration"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                        >
                            Round Duration
                        </label>
                        <div class="relative">
                            <select
                                v-model="roundDuration"
                                id="roundDuration"
                                class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all"
                            >
                                <option
                                    value="15"
                                    class="bg-[#111117] text-white"
                                >
                                    15 seconds — Blitz
                                </option>
                                <option
                                    value="30"
                                    class="bg-[#111117] text-white"
                                >
                                    30 seconds — Fast
                                </option>
                                <option
                                    value="60"
                                    class="bg-[#111117] text-white"
                                >
                                    60 seconds — Standard
                                </option>
                                <option
                                    value="120"
                                    class="bg-[#111117] text-white"
                                >
                                    2 minutes — Relaxed
                                </option>
                                <option
                                    value="180"
                                    class="bg-[#111117] text-white"
                                >
                                    3 minutes — Explorer
                                </option>
                                <option
                                    value="300"
                                    class="bg-[#111117] text-white"
                                >
                                    5 minutes — No Rush
                                </option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5"
                            >
                                <svg
                                    class="w-4 h-4 text-white/30"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Initial Health -->
                    <div class="space-y-1.5">
                        <label
                            for="initialHealth"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                        >
                            Starting Health
                        </label>
                        <div class="relative">
                            <select
                                v-model="initialHealth"
                                id="initialHealth"
                                class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all"
                            >
                                <option
                                    value="3000"
                                    class="bg-[#111117] text-white"
                                >
                                    3,000 HP — Quick
                                </option>
                                <option
                                    value="6000"
                                    class="bg-[#111117] text-white"
                                >
                                    6,000 HP — Standard
                                </option>
                                <option
                                    value="10000"
                                    class="bg-[#111117] text-white"
                                >
                                    10,000 HP — Endurance
                                </option>
                                <option
                                    value="20000"
                                    class="bg-[#111117] text-white"
                                >
                                    20,000 HP — Marathon
                                </option>
                                <option
                                    value="50000"
                                    class="bg-[#111117] text-white"
                                >
                                    50,000 HP — Unkillable
                                </option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5"
                            >
                                <svg
                                    class="w-4 h-4 text-white/30"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div
                        v-if="multiplayerStore.error"
                        class="flex items-start gap-3 p-3.5 bg-red-500/[0.07] border border-red-500/20 rounded-lg"
                    >
                        <svg
                            class="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p class="text-sm text-red-400">
                            {{ multiplayerStore.error }}
                        </p>
                    </div>

                    <!-- Submit -->
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.06] disabled:text-white/25 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm mt-2 shadow-lg shadow-[#D36040]/10"
                    >
                        <svg
                            v-if="isLoading"
                            class="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            ></circle>
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <svg
                            v-else
                            class="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        {{ isLoading ? "Creating room…" : "Create Room" }}
                    </button>
                </form>
            </div>

            <!-- Back link -->
            <div class="text-center mt-6">
                <router-link
                    to="/"
                    class="inline-flex items-center gap-1.5 text-sm text-white/25 hover:text-white/50 transition-colors"
                >
                    <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Back to Home
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMultiplayerStore } from "../stores/MultiplayerStore";

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const maxPlayers = ref(4);
const roundsTotal = ref(5);
const initialHealth = ref(6000);
const roundDuration = ref(60);
const isLoading = ref(false);

async function handleCreateGame() {
    isLoading.value = true;
    const success = await multiplayerStore.createGame({
        maxPlayers: parseInt(maxPlayers.value),
        roundsTotal: parseInt(roundsTotal.value),
        initialHealth: parseInt(initialHealth.value),
        RoundDurationSeconds: parseInt(roundDuration.value),
    });

    if (success) {
        router.push("/multiplayer/lobby");
    }
    isLoading.value = false;
}
</script>
