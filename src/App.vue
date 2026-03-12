<template>
    <div id="app-container" class="min-h-screen flex flex-col">
        <!-- Navigation (hidden on fullscreen game routes) -->
        <nav
            v-if="!isGameRoute"
            class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            :class="
                isHome
                    ? 'bg-transparent'
                    : 'bg-[#09090B]/90 backdrop-blur-xl border-b border-white/[0.06]'
            "
        >
            <div
                class="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between"
            >
                <!-- Logo -->
                <router-link to="/" class="flex items-center gap-2.5 group">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-[#D36040] transition-transform duration-300 group-hover:rotate-12"
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
                    <span class="text-white font-semibold text-sm tracking-wide"
                        >TerraQuest</span
                    >
                </router-link>

                <!-- Center Nav Links -->
                <div class="hidden md:flex items-center gap-1">
                    <router-link
                        to="/game"
                        class="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                        active-class="text-white bg-white/[0.06]"
                    >
                        Play
                    </router-link>
                    <router-link
                        to="/leaderboard"
                        class="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                        active-class="text-white bg-white/[0.06]"
                    >
                        Leaderboard
                    </router-link>
                    <router-link
                        to="/multiplayer/create"
                        class="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
                        active-class="text-white bg-white/[0.06]"
                    >
                        Multiplayer
                    </router-link>
                </div>

                <!-- Auth Section -->
                <div class="flex items-center gap-2">
                    <template v-if="!authStore.isAuthenticated">
                        <router-link
                            to="/login"
                            class="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors rounded-lg"
                        >
                            Sign in
                        </router-link>
                        <router-link
                            to="/register"
                            class="px-5 py-2 text-sm font-medium bg-[#D36040] hover:bg-[#b04a2e] text-white rounded-full transition-all"
                        >
                            Sign up
                        </router-link>
                    </template>

                    <template v-else>
                        <div class="relative group">
                            <!-- Avatar Button -->
                            <button
                                class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                            >
                                <div
                                    class="w-7 h-7 rounded-full bg-[#D36040]/15 border border-[#D36040]/30 flex items-center justify-center text-xs font-semibold text-[#D36040] select-none"
                                >
                                    {{
                                        authStore.userProfile?.username
                                            ?.charAt(0)
                                            .toUpperCase() || "U"
                                    }}
                                </div>
                                <span
                                    class="text-sm text-white/70 hidden sm:block"
                                >
                                    {{
                                        authStore.userProfile?.username ||
                                        "User"
                                    }}
                                </span>
                                <svg
                                    class="w-3.5 h-3.5 text-white/30 transition-transform duration-200 group-hover:rotate-180"
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
                            </button>

                            <!-- Dropdown -->
                            <div
                                class="absolute right-0 top-full mt-2 w-52 bg-[#111117] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 py-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 origin-top-right"
                            >
                                <!-- User info -->
                                <div
                                    class="px-4 py-3 border-b border-white/[0.06]"
                                >
                                    <p
                                        class="text-sm font-medium text-white truncate"
                                    >
                                        {{
                                            authStore.userProfile?.username ||
                                            "User"
                                        }}
                                    </p>
                                    <p
                                        class="text-xs text-white/30 truncate mt-0.5"
                                    >
                                        {{ authStore.userProfile?.email || "" }}
                                    </p>
                                </div>

                                <div class="py-1">
                                    <router-link
                                        to="/profile"
                                        class="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors mx-1 rounded-lg"
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
                                                stroke-width="1.5"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        Profile
                                    </router-link>
                                    <router-link
                                        to="/leaderboard"
                                        class="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors mx-1 rounded-lg"
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
                                                stroke-width="1.5"
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                        Leaderboard
                                    </router-link>
                                </div>

                                <div class="h-px bg-white/[0.06] mx-3"></div>

                                <div class="py-1">
                                    <button
                                        @click="handleLogout"
                                        class="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] transition-colors mx-1 rounded-lg"
                                        style="width: calc(100% - 0.5rem)"
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
                    </template>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 w-full relative">
            <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <!-- Footer (hidden on home & game routes) -->
        <footer
            v-if="!isGameRoute && !isHome"
            class="py-8 border-t border-white/[0.05]"
        >
            <div
                class="max-w-screen-xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
                <div class="flex items-center gap-2.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 text-[#D36040]/60"
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
                    <p class="text-sm text-white/20">© 2025 TerraQuest</p>
                </div>
                <div class="flex gap-6">
                    <a
                        href="#"
                        class="text-sm text-white/20 hover:text-white/50 transition-colors"
                        >Privacy</a
                    >
                    <a
                        href="#"
                        class="text-sm text-white/20 hover:text-white/50 transition-colors"
                        >Terms</a
                    >
                    <a
                        href="#"
                        class="text-sm text-white/20 hover:text-white/50 transition-colors"
                        >Contact</a
                    >
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGameStore } from "./stores/GameStore";
import { useAuthStore } from "./stores/AuthStore";

const gameStore = useGameStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isHome = computed(() => route.path === "/");
const isGameRoute = computed(() =>
    ["/game", "/multiplayer/game"].includes(route.path),
);

const loadGoogleMapsScript = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("VITE_GOOGLE_MAPS_API_KEY not found.");
        gameStore.setMapsApiReady(false);
        return;
    }

    window.initMap = () => {
        console.log("Google Maps API loaded.");
        gameStore.setMapsApiReady(true);
    };

    if (document.getElementById("google-maps-script")) {
        if (window.google && window.google.maps) {
            if (!gameStore.isMapsApiReady) {
                gameStore.setMapsApiReady(true);
            }
        }
        return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        console.error("Failed to load Google Maps script.");
        gameStore.setMapsApiReady(false);
    };
    document.head.appendChild(script);
};

onMounted(() => {
    authStore.initializeAuth();
    if (window.google && window.google.maps) {
        gameStore.setMapsApiReady(true);
    } else {
        loadGoogleMapsScript();
    }
});

const handleLogout = () => {
    authStore.logout();
    router.push("/login");
};
</script>
