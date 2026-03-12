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
            class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D36040]/5 rounded-full blur-[120px] pointer-events-none"
        ></div>

        <div class="relative z-10 w-full max-w-md">
            <!-- Logo -->
            <div class="flex flex-col items-center mb-10">
                <div
                    class="w-12 h-12 rounded-2xl bg-[#D36040]/10 border border-[#D36040]/20 flex items-center justify-center mb-4"
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
                <h1 class="text-xl font-semibold text-white tracking-wide">
                    TerraQuest
                </h1>
                <p class="text-xs text-white/30 mt-1 tracking-wider">
                    Geography Challenge
                </p>
            </div>

            <!-- Success: Recovery Code Card -->
            <div
                v-if="registrationSuccess"
                class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
                <!-- Success header -->
                <div class="flex flex-col items-center text-center mb-8">
                    <div
                        class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-7 h-7 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 class="text-xl font-semibold text-white">
                        Account Created
                    </h2>
                    <p class="text-sm text-white/40 mt-1.5 max-w-xs">
                        Welcome to TerraQuest. Save your recovery code — it's
                        the only way to reset your password.
                    </p>
                </div>

                <!-- Recovery code box -->
                <div
                    class="bg-[#09090B] border border-white/[0.08] rounded-xl p-5 mb-6"
                >
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <svg
                                class="w-4 h-4 text-amber-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <span
                                class="text-xs font-medium text-amber-400 tracking-wide"
                                >Save this code</span
                            >
                        </div>
                        <button
                            @click="copyRecoveryCode"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-white/50 hover:text-white transition-all"
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
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            Copy
                        </button>
                    </div>
                    <code
                        class="block font-mono text-2xl text-[#D36040] tracking-[0.25em] text-center py-2"
                    >
                        {{ recoveryCode }}
                    </code>
                </div>

                <p
                    class="text-xs text-white/25 text-center mb-6 leading-relaxed"
                >
                    We don't use email recovery. This code is the only way to
                    reset your password if you forget it.
                </p>

                <router-link
                    to="/login"
                    class="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all text-sm"
                >
                    Continue to Sign In
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
                </router-link>
            </div>

            <!-- Registration Form Card -->
            <div
                v-else
                class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
                <div class="mb-8">
                    <h2 class="text-2xl font-semibold text-white">
                        Create account
                    </h2>
                    <p class="text-sm text-white/40 mt-1.5">
                        Join the geography challenge.
                    </p>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-5">
                    <!-- Username -->
                    <div class="space-y-1.5">
                        <label
                            for="username"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                            >Username</label
                        >
                        <input
                            v-model="username"
                            id="username"
                            type="text"
                            required
                            minlength="3"
                            placeholder="Choose a username"
                            class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/60 focus:ring-1 focus:ring-[#D36040]/20 transition-all text-sm"
                        />
                    </div>

                    <!-- Email -->
                    <div class="space-y-1.5">
                        <label
                            for="email"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                            >Email</label
                        >
                        <input
                            v-model="email"
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/60 focus:ring-1 focus:ring-[#D36040]/20 transition-all text-sm"
                        />
                    </div>

                    <!-- Password -->
                    <div class="space-y-1.5">
                        <label
                            for="password"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                            >Password</label
                        >
                        <input
                            v-model="password"
                            id="password"
                            type="password"
                            required
                            minlength="6"
                            placeholder="At least 6 characters"
                            class="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/60 focus:ring-1 focus:ring-[#D36040]/20 transition-all text-sm"
                        />
                    </div>

                    <!-- Error -->
                    <div
                        v-if="authError"
                        class="flex items-start gap-3 p-4 bg-red-500/[0.08] border border-red-500/20 rounded-lg"
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
                        <p class="text-sm text-red-400">{{ authError }}</p>
                    </div>

                    <!-- Submit -->
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full flex items-center justify-center gap-2 py-3 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.06] disabled:text-white/25 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm mt-2"
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
                        {{
                            isLoading ? "Creating account..." : "Create account"
                        }}
                    </button>
                </form>
            </div>

            <!-- Sign in link -->
            <p class="text-center text-sm text-white/25 mt-6">
                Already have an account?
                <router-link
                    to="/login"
                    class="text-white/50 hover:text-white transition-colors ml-1 font-medium"
                >
                    Sign in
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

const username = ref("");
const email = ref("");
const password = ref("");
const registrationSuccess = ref(false);
const recoveryCode = ref("");

const isLoading = computed(() => authStore.isLoading);
const authError = computed(() => authStore.authError);

const copyRecoveryCode = async () => {
    try {
        await navigator.clipboard.writeText(recoveryCode.value);
        alert("Recovery code copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy text: ", err);
    }
};

const handleRegister = async () => {
    if (!username.value || !email.value || !password.value) {
        authStore.setError("Please fill in all fields.");
        return;
    }

    if (password.value.length < 6) {
        authStore.setError("Password must be at least 6 characters.");
        return;
    }

    authStore.clearError();

    const result = await authStore.register({
        username: username.value,
        email: email.value,
        password: password.value,
    });

    if (result.success) {
        registrationSuccess.value = true;
        recoveryCode.value = result.data?.recoveryCode || "";
    }
};
</script>
