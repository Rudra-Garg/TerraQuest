<template>
    <div
        class="relative min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-20 overflow-hidden"
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
                <router-link
                    to="/"
                    class="flex flex-col items-center gap-3 group"
                >
                    <div
                        class="w-12 h-12 rounded-2xl bg-[#D36040]/10 border border-[#D36040]/20 flex items-center justify-center transition-all duration-300 group-hover:bg-[#D36040]/15 group-hover:border-[#D36040]/35"
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
                    <span class="text-lg font-semibold text-white tracking-wide"
                        >TerraQuest</span
                    >
                </router-link>
            </div>

            <!-- Success state -->
            <div
                v-if="resetSuccess"
                class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm text-center"
            >
                <div
                    class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5"
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
                <h2 class="text-xl font-semibold text-white mb-2">
                    Password updated
                </h2>
                <p class="text-sm text-white/40 leading-relaxed mb-8">
                    Your password has been successfully reset. You can now sign
                    in with your new credentials.
                </p>
                <router-link
                    to="/login"
                    class="w-full flex items-center justify-center gap-2 py-3 bg-[#D36040] hover:bg-[#b04a2e] text-white font-medium rounded-lg transition-all text-sm"
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
                            d="M11 16l-4-4m0 0l4-4m-4 4h14"
                        />
                    </svg>
                    Back to sign in
                </router-link>
            </div>

            <!-- Reset form -->
            <div
                v-else
                class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
                <div class="mb-8">
                    <h2 class="text-2xl font-semibold text-white">
                        Reset password
                    </h2>
                    <p class="text-sm text-white/40 mt-1.5">
                        Enter your email, recovery code, and a new password.
                    </p>
                </div>

                <form @submit.prevent="handleResetPassword" class="space-y-5">
                    <!-- Email -->
                    <div class="space-y-1.5">
                        <label
                            for="email"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                            >Email</label
                        >
                        <div class="relative">
                            <div
                                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                            >
                                <svg
                                    class="w-4 h-4 text-white/20"
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
                            </div>
                            <input
                                v-model="email"
                                id="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                class="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <!-- Recovery Code -->
                    <div class="space-y-1.5">
                        <label
                            for="recoveryCode"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                            >Recovery Code</label
                        >
                        <div class="relative">
                            <div
                                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                            >
                                <svg
                                    class="w-4 h-4 text-white/20"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    />
                                </svg>
                            </div>
                            <input
                                v-model="recoveryCode"
                                id="recoveryCode"
                                type="text"
                                required
                                placeholder="Enter your recovery code"
                                class="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all text-sm font-mono tracking-wider"
                            />
                        </div>
                    </div>

                    <!-- New Password -->
                    <div class="space-y-1.5">
                        <label
                            for="newPassword"
                            class="block text-xs font-medium text-white/40 uppercase tracking-wider"
                            >New Password</label
                        >
                        <div class="relative">
                            <div
                                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                            >
                                <svg
                                    class="w-4 h-4 text-white/20"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <input
                                v-model="newPassword"
                                id="newPassword"
                                type="password"
                                required
                                minlength="6"
                                placeholder="New password (min 6 characters)"
                                class="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/50 focus:ring-1 focus:ring-[#D36040]/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <!-- Error -->
                    <div
                        v-if="authError"
                        class="flex items-start gap-3 p-4 bg-red-500/[0.07] border border-red-500/20 rounded-lg"
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
                        class="w-full flex items-center justify-center gap-2 py-3 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.05] disabled:text-white/25 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm mt-2"
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
                        {{ isLoading ? "Resetting..." : "Reset password" }}
                    </button>
                </form>
            </div>

            <!-- Back to sign in -->
            <p class="text-center text-sm text-white/25 mt-6">
                Remember your password?
                <router-link
                    to="/login"
                    class="text-white/50 hover:text-white transition-colors ml-1"
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

const authStore = useAuthStore();

const email = ref("");
const recoveryCode = ref("");
const newPassword = ref("");
const resetSuccess = ref(false);

const isLoading = computed(() => authStore.isLoading);
const authError = computed(() => authStore.authError);

const handleResetPassword = async () => {
    if (!email.value || !recoveryCode.value || !newPassword.value) {
        authStore.setError("Please fill in all fields.");
        return;
    }

    if (newPassword.value.length < 6) {
        authStore.setError("New password must be at least 6 characters.");
        return;
    }

    authStore.clearError();

    const result = await authStore.resetPassword({
        email: email.value,
        recoveryCode: recoveryCode.value,
        newPassword: newPassword.value,
    });

    if (result?.success) {
        resetSuccess.value = true;
        authStore.clearError();
    }
};
</script>
