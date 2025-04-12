<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white mx-auto mb-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <h2 class="text-2xl font-bold text-white">Sign in to TerraQuest</h2>
                <p class="mt-2 text-sm text-blue-200">
                    Continue your geography adventure
                </p>
            </div>

            <div class="px-6 py-8">
                <form @submit.prevent="handleLogin" class="space-y-5">
                    <!-- Email Field -->
                    <div class="mt-4 relative rounded-md shadow-sm">
                        <!-- Icon -->
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5
               a2.5 2.5 0 005 0V12a9 9 0 10-9 9
               m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <!-- Vertical Divider -->
                        <div class="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                            <div class="h-6 w-px bg-gray-300"></div>
                        </div>
                        <!-- Input -->
                        <input v-model="email" id="email" name="email" type="email" required
                            placeholder="you@example.com" class="block w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                sm:text-sm" />
                    </div>

                    <!-- Password Field -->
                    <div class="mt-4 relative rounded-md shadow-sm">
                        <!-- Icon -->
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6
               a2 2 0 00-2-2H6a2 2 0 00-2 2v6
               a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <!-- Vertical Divider -->
                        <div class="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                            <div class="h-6 w-px bg-gray-300"></div>
                        </div>
                        <!-- Input -->
                        <input v-model="password" id="password" name="password" type="password" required
                            placeholder="Enter your password" class="block w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                sm:text-sm" />
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input v-model="rememberMe" id="remember-me" name="remember-me" type="checkbox"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <label for="remember-me" class="ml-2 block text-sm text-gray-600">
                                Remember me
                            </label>
                        </div>

                        <div class="text-sm">
                            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <!-- Error Message Display -->
                    <div v-if="authError" class="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                    fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-red-700">{{ authError }}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button type="submit" :disabled="isLoading"
                            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                            <span v-if="isLoading" class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Signing in...
                            </span>
                            <span v-else>Sign in</span>
                        </button>
                    </div>

                    <div class="text-center mt-6">
                        <p class="text-sm text-gray-600">
                            Don't have an account?
                            <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 ml-1">
                                Create an account
                            </router-link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Form data
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

// Computed state from store
const isLoading = computed(() => authStore.isLoading);
const authError = computed(() => authStore.authError);

// Handle login form submission
const handleLogin = async () => {
    // Basic form validation
    if (!email.value || !password.value) {
        authStore.setError("Please enter both email and password.");
        return;
    }

    // Clear any previous errors
    authStore.clearError();

    // Attempt login
    const success = await authStore.login({
        email: email.value,
        password: password.value,
        // Remember me could be used for token expiration settings
        // or other persistence features on the backend
        remember: rememberMe.value
    });

    if (success) {
        // Redirect to home or previous page
        router.push('/');
    }
    // Error handling is done in the store and displayed via the authError computed property
};
</script>