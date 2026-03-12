<template>
    <div
        class="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-20 relative overflow-hidden"
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
            class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D36040]/5 rounded-full blur-[100px] pointer-events-none"
        ></div>

        <div class="relative z-10 w-full max-w-md">
            <!-- Back link -->
            <router-link
                to="/"
                class="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Back
            </router-link>

            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
                    >
                        <svg
                            class="w-5 h-5 text-white/50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-xl font-semibold text-white">
                            Join a Game
                        </h1>
                        <p class="text-sm text-white/35">
                            Enter the room code to join your friends.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Card -->
            <div
                class="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-sm"
            >
                <form @submit.prevent="handleJoinGame" class="space-y-6">
                    <!-- Code input -->
                    <div class="space-y-2">
                        <label
                            for="gameCode"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                        >
                            Room Code
                        </label>

                        <!-- Large mono input -->
                        <div class="relative">
                            <input
                                v-model="inputGameCode"
                                id="gameCode"
                                type="text"
                                maxlength="6"
                                placeholder="XXXXXX"
                                required
                                class="w-full px-6 py-5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-3xl font-mono tracking-[0.5em] uppercase placeholder:text-white/15 placeholder:tracking-[0.5em] text-center focus:outline-none focus:border-[#D36040]/50 focus:ring-2 focus:ring-[#D36040]/10 transition-all"
                            />
                            <!-- Character count indicator -->
                            <div class="absolute bottom-2 right-3 flex gap-1">
                                <span
                                    v-for="i in 6"
                                    :key="i"
                                    class="w-1.5 h-1.5 rounded-full transition-all duration-150"
                                    :class="
                                        i <= inputGameCode.length
                                            ? 'bg-[#D36040]'
                                            : 'bg-white/15'
                                    "
                                ></span>
                            </div>
                        </div>

                        <p class="text-xs text-white/25 text-center">
                            6-character code shared by the host
                        </p>
                    </div>

                    <!-- Error -->
                    <div
                        v-if="multiplayerStore.error"
                        class="flex items-start gap-3 p-3.5 bg-red-500/[0.07] border border-red-500/20 rounded-xl"
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
                        :disabled="isLoading || inputGameCode.length < 6"
                        class="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.06] disabled:text-white/25 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm shadow-lg shadow-[#D36040]/10 hover:shadow-[#D36040]/20 hover:scale-[1.01] active:scale-[0.99]"
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
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                        {{ isLoading ? "Joining..." : "Join Game" }}
                    </button>
                </form>
            </div>

            <!-- Create instead -->
            <p class="text-center text-sm text-white/25 mt-6">
                Don't have a code?
                <router-link
                    to="/multiplayer/create"
                    class="text-white/50 hover:text-white transition-colors ml-1 font-medium"
                >
                    Create a game
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMultiplayerStore } from "../stores/MultiplayerStore";

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const inputGameCode = ref("");
const isLoading = ref(false);

async function handleJoinGame() {
    if (!inputGameCode.value) return;

    isLoading.value = true;
    const codeToJoin = inputGameCode.value.toUpperCase();
    const success = await multiplayerStore.joinGame(codeToJoin);

    if (success) {
        router.push("/multiplayer/lobby");
    }
    isLoading.value = false;
}
</script>
