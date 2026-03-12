<template>
    <div
        class="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-24 relative overflow-hidden"
    >
        <!-- Background dot grid -->
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
            class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D36040]/5 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative z-10 w-full max-w-md">
            <!-- Logo -->
            <div class="flex flex-col items-center mb-10">
                <div
                    class="w-12 h-12 rounded-2xl bg-[#D36040]/10 border border-[#D36040]/20 flex items-center justify-center mb-4 shadow-lg shadow-[#D36040]/5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 text-[#D36040]"
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
                <span class="text-white font-semibold text-lg tracking-wide"
                    >TerraQuest</span
                >
            </div>

            <!-- Card -->
            <div
                class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
            >
                <div class="mb-8">
                    <h2
                        class="text-2xl font-semibold text-white tracking-tight"
                    >
                        Welcome back
                    </h2>
                    <p class="text-sm text-white/35 mt-1.5">
                        Sign in to continue your journey.
                    </p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-5">
                    <!-- Email -->
                    <div class="space-y-1.5">
                        <label
                            for="email"
                            class="block text-xs font-medium text-white/40 uppercase tracking-widest"
                        >
                            Email
                        </label>
                        <input
                            v-model="email"
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/50 focus:ring-2 focus:ring-[#D36040]/10 transition-all"
                        />
                    </div>

                    <!-- Password -->
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between">
                            <label
                                for="password"
                                class="block text-xs font-medium text-white/40 uppercase tracking-widest"
                            >
                                Password
                            </label>
                            <router-link
                                to="/forgot-password"
                                class="text-xs text-[#D36040]/60 hover:text-[#D36040] transition-colors"
                            >
                                Forgot password?
                            </router-link>
                        </div>
                        <input
                            v-model="password"
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/50 focus:ring-2 focus:ring-[#D36040]/10 transition-all"
                        />
                    </div>

                    <!-- Remember me -->
                    <div class="flex items-center gap-2.5">
                        <input
                            v-model="rememberMe"
                            id="remember-me"
                            type="checkbox"
                            class="w-4 h-4 rounded border border-white/20 bg-white/5 accent-[#D36040] cursor-pointer"
                        />
                        <label
                            for="remember-me"
                            class="text-sm text-white/40 cursor-pointer select-none"
                        >
                            Remember me
                        </label>
                    </div>

                    <!-- Error -->
                    <div
                        v-if="authError"
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
                        <p class="text-sm text-red-400/90">{{ authError }}</p>
                    </div>

                    <!-- Submit -->
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full flex items-center justify-center gap-2.5 py-3 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.06] disabled:text-white/25 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm shadow-lg shadow-[#D36040]/15 hover:shadow-[#D36040]/25 hover:scale-[1.01] active:scale-[0.99]"
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
                        {{ isLoading ? "Signing in…" : "Sign in" }}
                    </button>
                </form>
            </div>

            <!-- Sign up link -->
            <p class="text-center text-sm text-white/25 mt-6">
                Don't have an account?
                <router-link
                    to="/register"
                    class="text-white/60 hover:text-white ml-1 transition-colors font-medium"
                >
                    Create one
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/AuthStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const rememberMe = ref(false);

const isLoading = computed(() => authStore.isLoading);
const authError = computed(() => authStore.authError);

const handleLogin = async () => {
    if (!email.value || !password.value) {
        authStore.setError("Please enter both email and password.");
        return;
    }

    authStore.clearError();

    const success = await authStore.login({
        email: email.value,
        password: password.value,
        remember: rememberMe.value,
    });

    if (success) {
        router.push("/");
    }
};
</script>
