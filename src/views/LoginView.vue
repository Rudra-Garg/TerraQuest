<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-900">Login to TerraQuest</h2>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                    <input v-model="email" id="email" name="email" type="email" required
                        class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="you@example.com" />
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input v-model="password" id="password" name="password" type="password" required
                        class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Password" />
                </div>

                <!-- Error Message Display -->
                <p v-if="authError" class="text-sm text-red-600">{{ authError }}</p>

                <div>
                    <button type="submit" :disabled="isLoading"
                        class="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isLoading ? 'Logging in...' : 'Login' }}
                    </button>
                </div>
            </form>
            <p class="text-sm text-center text-gray-600">
                Don't have an account?
                <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore'; // Adjust path if needed
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const isLoading = computed(() => authStore.isLoading); // Assuming store has loading state
const authError = computed(() => authStore.authError); // Assuming store has error state

const handleLogin = async () => {
    if (!email.value || !password.value) {
        // Basic frontend validation
        authStore.setError("Please enter both email and password."); // Use store action/mutation
        return;
    }
    const success = await authStore.login({
        email: email.value,
        password: password.value,
    });

    if (success) {
        router.push('/game'); // Or wherever you want logged-in users to go
    }
    // Error handling is done within the authStore.login action
};
</script>