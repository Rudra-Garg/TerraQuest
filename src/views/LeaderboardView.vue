<template>
    <div class="min-h-screen bg-[#09090B] pt-24 pb-16 px-6">
        <div class="max-w-5xl mx-auto">
            <!-- Header -->
            <div class="mb-10">
                <div class="flex items-center gap-2 mb-3">
                    <span
                        class="w-1.5 h-1.5 rounded-full bg-[#D36040] animate-pulse"
                    ></span>
                    <span
                        class="text-xs text-[#D36040] font-medium tracking-[0.2em] uppercase"
                        >Global Rankings</span
                    >
                </div>
                <h1 class="text-3xl font-semibold text-white tracking-tight">
                    Leaderboard
                </h1>
                <p class="text-sm text-white/35 mt-1.5">
                    See how explorers rank across the world.
                </p>
            </div>

            <!-- Tabs -->
            <div
                class="flex items-center gap-1 mb-8 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit"
            >
                <button
                    type="button"
                    @click="activeTab = 'all-time'"
                    :class="[
                        'px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        activeTab === 'all-time'
                            ? 'bg-[#D36040] text-white shadow-lg shadow-[#D36040]/20'
                            : 'text-white/40 hover:text-white hover:bg-white/[0.05]',
                    ]"
                >
                    All Time
                </button>
                <button
                    type="button"
                    @click="activeTab = 'monthly'"
                    :class="[
                        'px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        activeTab === 'monthly'
                            ? 'bg-[#D36040] text-white shadow-lg shadow-[#D36040]/20'
                            : 'text-white/40 hover:text-white hover:bg-white/[0.05]',
                    ]"
                >
                    This Month
                </button>
                <button
                    type="button"
                    @click="activeTab = 'weekly'"
                    :class="[
                        'px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        activeTab === 'weekly'
                            ? 'bg-[#D36040] text-white shadow-lg shadow-[#D36040]/20'
                            : 'text-white/40 hover:text-white hover:bg-white/[0.05]',
                    ]"
                >
                    This Week
                </button>
            </div>

            <!-- Top 3 Podium -->
            <div
                v-if="!isLoading && topPlayers.length > 0"
                class="grid grid-cols-3 gap-4 mb-6"
            >
                <!-- 2nd place -->
                <div
                    v-if="topPlayers[1]"
                    class="flex flex-col items-center justify-end bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 pt-8 relative overflow-hidden"
                >
                    <div
                        class="absolute top-3 left-3 w-6 h-6 rounded-full bg-zinc-400/10 border border-zinc-400/20 flex items-center justify-center"
                    >
                        <span class="text-xs font-semibold text-zinc-400"
                            >2</span
                        >
                    </div>
                    <div
                        class="w-14 h-14 rounded-2xl bg-zinc-400/10 border border-zinc-400/20 flex items-center justify-center mb-3"
                    >
                        <span
                            class="leaderboard-avatar-text text-2xl font-light text-zinc-300"
                        >
                            {{ topPlayers[1].username.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <p
                        class="text-sm font-medium text-white/80 truncate max-w-full text-center"
                    >
                        {{ topPlayers[1].username }}
                    </p>
                    <p
                        class="text-lg font-light text-zinc-300 tabular-nums mt-1"
                    >
                        {{ topPlayers[1].totalPoints.toLocaleString() }}
                    </p>
                    <p class="text-xs text-white/25 mt-0.5">
                        {{ topPlayers[1].gamesPlayed }} games
                    </p>
                </div>
                <div
                    v-else
                    class="rounded-2xl border border-dashed border-white/[0.06]"
                ></div>

                <!-- 1st place -->
                <div
                    v-if="topPlayers[0]"
                    class="flex flex-col items-center justify-end bg-[#D36040]/[0.06] border border-[#D36040]/20 rounded-2xl p-6 pt-8 relative overflow-hidden -mt-4"
                >
                    <!-- Glow -->
                    <div
                        class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D36040]/60 to-transparent"
                    ></div>
                    <div
                        class="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#D36040]/15 border border-[#D36040]/30 flex items-center justify-center"
                    >
                        <svg
                            class="w-3.5 h-3.5 text-[#D36040]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                        </svg>
                    </div>
                    <div
                        class="w-16 h-16 rounded-2xl bg-[#D36040]/15 border border-[#D36040]/30 flex items-center justify-center mb-3"
                    >
                        <span
                            class="leaderboard-avatar-text text-2xl font-light text-[#D36040]"
                        >
                            {{ topPlayers[0].username.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <p
                        class="text-sm font-semibold text-white truncate max-w-full text-center"
                    >
                        {{ topPlayers[0].username }}
                    </p>
                    <p
                        class="text-xl font-light text-[#D36040] tabular-nums mt-1"
                    >
                        {{ topPlayers[0].totalPoints.toLocaleString() }}
                    </p>
                    <p class="text-xs text-white/30 mt-0.5">
                        {{ topPlayers[0].gamesPlayed }} games
                    </p>
                </div>
                <div
                    v-else
                    class="rounded-2xl border border-dashed border-white/[0.06]"
                ></div>

                <!-- 3rd place -->
                <div
                    v-if="topPlayers[2]"
                    class="flex flex-col items-center justify-end bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 pt-8 relative overflow-hidden"
                >
                    <div
                        class="absolute top-3 left-3 w-6 h-6 rounded-full bg-amber-700/10 border border-amber-700/20 flex items-center justify-center"
                    >
                        <span class="text-xs font-semibold text-amber-600"
                            >3</span
                        >
                    </div>
                    <div
                        class="w-14 h-14 rounded-2xl bg-amber-700/10 border border-amber-700/20 flex items-center justify-center mb-3"
                    >
                        <span
                            class="leaderboard-avatar-text text-2xl font-light text-amber-600"
                        >
                            {{ topPlayers[2].username.charAt(0).toUpperCase() }}
                        </span>
                    </div>
                    <p
                        class="text-sm font-medium text-white/80 truncate max-w-full text-center"
                    >
                        {{ topPlayers[2].username }}
                    </p>
                    <p
                        class="text-lg font-light text-amber-600 tabular-nums mt-1"
                    >
                        {{ topPlayers[2].totalPoints.toLocaleString() }}
                    </p>
                    <p class="text-xs text-white/25 mt-0.5">
                        {{ topPlayers[2].gamesPlayed }} games
                    </p>
                </div>
                <div
                    v-else
                    class="rounded-2xl border border-dashed border-white/[0.06]"
                ></div>
            </div>

            <!-- Table -->
            <div
                class="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden relative"
            >
                <!-- Loading Overlay -->
                <div
                    v-if="isLoading"
                    class="absolute inset-0 bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl"
                >
                    <div class="flex flex-col items-center gap-3">
                        <svg
                            class="animate-spin h-7 w-7 text-[#D36040]"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-20"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="3"
                            ></circle>
                            <path
                                class="opacity-80"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p
                            class="text-xs text-white/40 tracking-wider uppercase"
                        >
                            Loading…
                        </p>
                    </div>
                </div>

                <!-- Table header -->
                <div
                    class="grid grid-cols-[3rem_1fr_6rem_6rem_6rem_8rem] gap-0 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                    <div
                        class="text-xs text-white/25 font-medium tracking-wider uppercase text-center"
                    >
                        #
                    </div>
                    <div
                        class="text-xs text-white/25 font-medium tracking-wider uppercase pl-2"
                    >
                        Player
                    </div>
                    <div
                        class="text-xs text-white/25 font-medium tracking-wider uppercase text-center"
                    >
                        Games
                    </div>
                    <div
                        class="text-xs text-white/25 font-medium tracking-wider uppercase text-center"
                    >
                        Avg
                    </div>
                    <div
                        class="text-xs text-white/25 font-medium tracking-wider uppercase text-center"
                    >
                        Best
                    </div>
                    <div
                        class="text-xs text-white/25 font-medium tracking-wider uppercase text-right pr-2"
                    >
                        Total
                    </div>
                </div>

                <!-- Other players -->
                <div v-if="!isLoading && otherPlayers.length > 0">
                    <div
                        v-for="(player, index) in otherPlayers"
                        :key="player.id"
                        class="grid grid-cols-[3rem_1fr_6rem_6rem_6rem_8rem] gap-0 px-4 py-3.5 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors group"
                        :class="{
                            'bg-[#D36040]/[0.04] border-l-2 border-l-[#D36040]/50 !pl-[calc(1rem-2px)]':
                                player.isCurrentUser,
                        }"
                    >
                        <!-- Rank -->
                        <div class="flex items-center justify-center">
                            <span
                                class="text-sm text-white/30 tabular-nums font-mono"
                                >{{ index + 4 }}</span
                            >
                        </div>

                        <!-- Player -->
                        <div class="flex items-center gap-3 pl-2 min-w-0">
                            <div
                                class="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.15] transition-colors text-sm text-white/50 font-medium select-none"
                            >
                                {{ player.username.charAt(0).toUpperCase() }}
                            </div>
                            <div class="min-w-0">
                                <p
                                    class="text-sm text-white/80 group-hover:text-white transition-colors truncate leading-none"
                                >
                                    {{ player.username }}
                                    <span
                                        v-if="player.isCurrentUser"
                                        class="ml-2 text-[10px] text-[#D36040] font-medium tracking-wide"
                                        >You</span
                                    >
                                </p>
                                <p class="text-xs text-white/25 mt-0.5">
                                    {{ formatDate(player.joinDate) }}
                                </p>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="flex items-center justify-center">
                            <span
                                class="text-sm text-white/50 tabular-nums font-mono"
                                >{{ player.gamesPlayed }}</span
                            >
                        </div>
                        <div class="flex items-center justify-center">
                            <span
                                class="text-sm text-white/50 tabular-nums font-mono"
                                >{{ player.avgScore }}</span
                            >
                        </div>
                        <div class="flex items-center justify-center">
                            <span
                                class="text-sm text-white/70 tabular-nums font-mono"
                                >{{ player.bestScore }}</span
                            >
                        </div>
                        <div class="flex items-center justify-end pr-2">
                            <span
                                class="text-sm font-medium tabular-nums font-mono"
                                :class="
                                    player.isCurrentUser
                                        ? 'text-[#D36040]'
                                        : 'text-white/80'
                                "
                            >
                                {{ player.totalPoints.toLocaleString() }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div
                    v-if="!isLoading && players.length === 0"
                    class="flex flex-col items-center justify-center py-20 gap-4"
                >
                    <div
                        class="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center"
                    >
                        <svg
                            class="w-8 h-8 text-white/15"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <div class="text-center">
                        <p class="text-sm font-medium text-white/40">
                            No data yet
                        </p>
                        <p class="text-xs text-white/20 mt-1">
                            Be the first to make the board.
                        </p>
                    </div>
                    <router-link
                        to="/game"
                        class="px-5 py-2 bg-[#D36040] hover:bg-[#b04a2e] text-white text-sm font-medium rounded-lg transition-all"
                    >
                        Play now
                    </router-link>
                </div>

                <!-- Pagination -->
                <div
                    v-if="totalPages > 1"
                    class="px-4 py-4 border-t border-white/[0.06] flex items-center justify-between"
                >
                    <span class="text-xs text-white/25">
                        Page
                        <span class="text-white/50">{{ currentPage }}</span> of
                        {{ totalPages }}
                    </span>
                    <div class="flex items-center gap-1">
                        <button
                            @click="currentPage = Math.max(1, currentPage - 1)"
                            :disabled="currentPage === 1"
                            class="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                                    stroke-width="2"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        <button
                            v-for="page in totalPages"
                            :key="page"
                            @click="currentPage = page"
                            :class="[
                                'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                                currentPage === page
                                    ? 'bg-[#D36040] text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/[0.06]',
                            ]"
                        >
                            {{ page }}
                        </button>

                        <button
                            @click="
                                currentPage = Math.min(
                                    totalPages,
                                    currentPage + 1,
                                )
                            "
                            :disabled="currentPage === totalPages"
                            class="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../stores/AuthStore";

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.userProfile?.id ?? null);

const currentPage = ref(1);
const pageSize = 10;
const activeTab = ref("all-time");
const isLoading = ref(false);
const leaderboardError = ref("");
const leaderboardEntries = ref([]);

const players = computed(() => {
    return [...leaderboardEntries.value]
        .map((player) => ({
            ...player,
            isCurrentUser: player.id === currentUserId.value,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints);
});

const topPlayers = computed(() => players.value.slice(0, 3));
const otherPlayers = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return players.value.slice(3).slice(start, start + pageSize);
});

const totalPages = computed(() => {
    return Math.max(
        1,
        Math.ceil(Math.max(0, players.value.length - 3) / pageSize),
    );
});

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "—";
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

async function fetchLeaderboard() {
    isLoading.value = true;
    leaderboardError.value = "";

    try {
        const baseUrl =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        const token = authStore.authToken;

        const response = await fetch(`${baseUrl}/api/v1/leaderboard`, {
            headers: token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {},
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                    `Failed to load leaderboard (HTTP ${response.status})`,
            );
        }

        leaderboardEntries.value = Array.isArray(data.players)
            ? data.players
            : [];
        currentPage.value = 1;
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        leaderboardError.value = error.message || "Failed to load leaderboard.";
        leaderboardEntries.value = [];
    } finally {
        isLoading.value = false;
    }
}

watch(activeTab, () => {
    currentPage.value = 1;
});

onMounted(() => {
    fetchLeaderboard();
});
</script>

<style scoped>
.leaderboard-avatar-text {
    font-family: "Playfair Display", Georgia, serif;
    font-style: italic;
}
</style>
