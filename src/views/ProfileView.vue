<template>
    <div class="min-h-screen bg-[#09090B] pt-24 pb-16 px-6">
        <div class="max-w-3xl mx-auto">
            <!-- User Card -->
            <div
                class="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden mb-6"
            >
                <!-- Top accent bar -->
                <div
                    class="h-1 w-full bg-gradient-to-r from-[#D36040] via-[#D36040]/60 to-transparent"
                ></div>

                <div class="p-8">
                    <div
                        class="flex flex-col sm:flex-row items-start sm:items-center gap-6"
                    >
                        <!-- Avatar -->
                        <div class="relative flex-shrink-0">
                            <div
                                class="w-20 h-20 rounded-2xl bg-[#D36040]/10 border border-[#D36040]/25 flex items-center justify-center"
                            >
                                <span
                                    class="profile-avatar-initial text-3xl font-light text-[#D36040] select-none"
                                >
                                    {{ userInitial }}
                                </span>
                            </div>
                            <!-- Online indicator -->
                            <span
                                class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#09090B]"
                            ></span>
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div
                                class="flex flex-wrap items-start justify-between gap-4"
                            >
                                <div>
                                    <h2
                                        class="text-2xl font-semibold text-white tracking-tight"
                                    >
                                        {{ user?.username || "Explorer" }}
                                    </h2>
                                    <p
                                        class="text-sm text-white/40 mt-1 flex items-center gap-1.5"
                                    >
                                        <svg
                                            class="w-3.5 h-3.5 text-white/25"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="1.5"
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        {{ user?.email || "No email provided" }}
                                    </p>
                                    <p
                                        v-if="profileError"
                                        class="text-xs text-red-400/80 mt-2"
                                    >
                                        {{ profileError }}
                                    </p>
                                    <p
                                        v-else
                                        class="text-xs text-white/25 mt-2 flex items-center gap-1.5"
                                    >
                                        <svg
                                            class="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="1.5"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Joined {{ formattedJoinDate }}
                                    </p>
                                </div>

                                <!-- Logout -->
                                <button
                                    @click="handleLogout"
                                    class="inline-flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/[0.08] border border-white/[0.07] hover:border-red-500/20 rounded-lg transition-all"
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
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div
                    class="grid grid-cols-2 md:grid-cols-4 border-t border-white/[0.06]"
                >
                    <!-- Games Played -->
                    <div
                        class="p-6 text-center border-r border-white/[0.06] last:border-r-0"
                    >
                        <div class="flex items-center justify-center mb-1">
                            <svg
                                class="w-4 h-4 text-white/20 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p class="text-3xl font-light text-white tabular-nums">
                            {{ user?.gamesPlayed || 0 }}
                        </p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider uppercase mt-1.5"
                        >
                            Games
                        </p>
                    </div>

                    <!-- High Score -->
                    <div
                        class="p-6 text-center border-r border-white/[0.06] last:border-r-0 md:border-b-0 border-b border-white/[0.06]"
                    >
                        <div class="flex items-center justify-center mb-1">
                            <svg
                                class="w-4 h-4 text-[#D36040]/40 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                            </svg>
                        </div>
                        <p
                            class="text-3xl font-light text-[#D36040] tabular-nums"
                        >
                            {{ user?.highScore || 0 }}
                        </p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider uppercase mt-1.5"
                        >
                            Best Score
                        </p>
                    </div>

                    <!-- Total Score -->
                    <div
                        class="p-6 text-center border-r border-white/[0.06] last:border-r-0"
                    >
                        <div class="flex items-center justify-center mb-1">
                            <svg
                                class="w-4 h-4 text-white/20 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <p class="text-3xl font-light text-white tabular-nums">
                            {{ user?.totalScore || 0 }}
                        </p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider uppercase mt-1.5"
                        >
                            Total Score
                        </p>
                    </div>

                    <!-- Average Score -->
                    <div class="p-6 text-center">
                        <div class="flex items-center justify-center mb-1">
                            <svg
                                class="w-4 h-4 text-white/20 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </div>
                        <p class="text-3xl font-light text-white tabular-nums">
                            {{ averageScore }}
                        </p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider uppercase mt-1.5"
                        >
                            Avg / Game
                        </p>
                    </div>
                </div>
            </div>

            <!-- Action Cards -->
            <div class="grid sm:grid-cols-2 gap-4 mb-4">
                <!-- Play Solo -->
                <router-link
                    to="/game"
                    class="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-[#D36040]/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-[140px]"
                >
                    <div class="flex items-start justify-between">
                        <div
                            class="w-10 h-10 rounded-xl bg-[#D36040]/10 border border-[#D36040]/20 flex items-center justify-center group-hover:bg-[#D36040]/20 transition-colors"
                        >
                            <svg
                                class="w-5 h-5 text-[#D36040]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <svg
                            class="w-4 h-4 text-white/20 group-hover:text-[#D36040]/60 translate-x-0 group-hover:translate-x-1 transition-all duration-300"
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
                    </div>
                    <div class="mt-4">
                        <h3
                            class="text-base font-semibold text-white group-hover:text-white transition-colors"
                        >
                            Play Solo
                        </h3>
                        <p class="text-sm text-white/35 mt-1">
                            Drop into a random location and test your geography.
                        </p>
                    </div>
                </router-link>

                <!-- Leaderboard -->
                <router-link
                    to="/leaderboard"
                    class="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-[140px]"
                >
                    <div class="flex items-start justify-between">
                        <div
                            class="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors"
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
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <svg
                            class="w-4 h-4 text-white/20 group-hover:text-white/50 translate-x-0 group-hover:translate-x-1 transition-all duration-300"
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
                    </div>
                    <div class="mt-4">
                        <h3
                            class="text-base font-semibold text-white/80 group-hover:text-white transition-colors"
                        >
                            Leaderboard
                        </h3>
                        <p class="text-sm text-white/35 mt-1">
                            See how you rank against other explorers.
                        </p>
                    </div>
                </router-link>
            </div>

            <!-- Multiplayer -->
            <div class="grid sm:grid-cols-2 gap-4 mb-4">
                <router-link
                    to="/multiplayer/create"
                    class="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-300 flex items-center gap-4"
                >
                    <div
                        class="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.1] transition-colors"
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </div>
                    <div>
                        <p
                            class="text-sm font-medium text-white/70 group-hover:text-white transition-colors"
                        >
                            Create Multiplayer Game
                        </p>
                        <p class="text-xs text-white/30 mt-0.5">
                            Host a room and invite friends
                        </p>
                    </div>
                </router-link>

                <router-link
                    to="/multiplayer/join"
                    class="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.15] rounded-2xl p-6 transition-all duration-300 flex items-center gap-4"
                >
                    <div
                        class="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.1] transition-colors"
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
                        <p
                            class="text-sm font-medium text-white/70 group-hover:text-white transition-colors"
                        >
                            Join a Game
                        </p>
                        <p class="text-xs text-white/30 mt-0.5">
                            Enter a room code to join
                        </p>
                    </div>
                </router-link>
            </div>

            <div
                class="mt-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
            >
                <div
                    class="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between gap-4"
                >
                    <div>
                        <h3 class="text-lg font-semibold text-white">
                            Recent Solo Games
                        </h3>
                        <p class="text-sm text-white/35 mt-1">
                            Your latest completed games and scores.
                        </p>
                    </div>
                    <button
                        @click="loadProfile"
                        class="px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] rounded-lg transition-all"
                    >
                        Refresh
                    </button>
                </div>

                <div
                    v-if="isLoadingProfile"
                    class="px-6 py-10 text-sm text-white/35"
                >
                    Loading profile…
                </div>

                <div
                    v-else-if="gameHistory.length === 0"
                    class="px-6 py-10 text-sm text-white/35"
                >
                    No solo games played yet.
                </div>

                <div v-else class="divide-y divide-white/[0.06]">
                    <div
                        v-for="game in gameHistory"
                        :key="game.id"
                        class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                        <div>
                            <p class="text-sm font-medium text-white">
                                Game #{{ game.id }}
                            </p>
                            <p class="text-xs text-white/30 mt-1">
                                {{ formatHistoryDate(game.createdAt) }} ·
                                {{ game.roundsPlayed }} rounds
                            </p>
                        </div>

                        <div class="flex items-center gap-6">
                            <div class="text-right">
                                <p
                                    class="text-[11px] uppercase tracking-wider text-white/30"
                                >
                                    Total Score
                                </p>
                                <p
                                    class="text-base font-semibold text-[#D36040]"
                                >
                                    {{ game.totalScore }}
                                </p>
                            </div>
                            <div class="text-right">
                                <p
                                    class="text-[11px] uppercase tracking-wider text-white/30"
                                >
                                    Avg / Round
                                </p>
                                <p class="text-sm text-white">
                                    {{
                                        Math.round(
                                            game.totalScore /
                                                Math.max(
                                                    game.roundsPlayed || 1,
                                                    1,
                                                ),
                                        )
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/AuthStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const profile = ref(null);
const gameHistory = ref([]);
const isLoadingProfile = ref(false);
const profileError = ref("");

const user = computed(() => profile.value || authStore.user);

const userInitial = computed(() => {
    if (user.value && user.value.username) {
        return user.value.username.charAt(0).toUpperCase();
    }
    return "?";
});

const averageScore = computed(() => {
    if (
        !user.value ||
        !user.value.gamesPlayed ||
        user.value.gamesPlayed === 0
    ) {
        return 0;
    }
    return Math.round(user.value.totalScore / user.value.gamesPlayed);
});

const formattedJoinDate = computed(() => {
    if (!user.value || !user.value.createdAt) {
        return "Recently";
    }
    const date = new Date(user.value.createdAt);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
});

const formatHistoryDate = (value) => {
    if (!value) return "Unknown date";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const loadProfile = async () => {
    const token = authStore.authToken;
    if (!token) {
        profileError.value = "You must be logged in to view your profile.";
        return;
    }

    isLoadingProfile.value = true;
    profileError.value = "";

    try {
        const baseUrl =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

        const [profileResponse, historyResponse] = await Promise.all([
            fetch(`${baseUrl}/api/v1/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            fetch(`${baseUrl}/api/v1/game/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        ]);

        const profileData = await profileResponse.json();
        const historyData = await historyResponse.json();

        if (!profileResponse.ok) {
            throw new Error(profileData.error || "Failed to load profile.");
        }

        if (!historyResponse.ok) {
            throw new Error(
                historyData.error || "Failed to load game history.",
            );
        }

        profile.value = profileData.user || null;
        gameHistory.value = Array.isArray(historyData.games)
            ? historyData.games
            : [];
    } catch (error) {
        profileError.value = error.message || "Failed to load profile data.";
    } finally {
        isLoadingProfile.value = false;
    }
};

const handleLogout = () => {
    authStore.logout();
    router.push("/login");
};

onMounted(() => {
    loadProfile();
});
</script>

<style scoped>
.profile-avatar-initial {
    font-family: "Playfair Display", Georgia, serif;
    font-style: italic;
}
</style>
