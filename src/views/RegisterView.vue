<template>
    <div class="flex items-center justify-center min-h-[calc(100vh-150px)]">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center text-gray-900">Create your TerraQuest Account</h2>
            <form @submit.prevent="handleRegister" class="space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input v-model="username" id="username" name="username" type="text" required minlength="3"
                        class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Choose a username" />
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                    <input v-model="email" id="email" name="email" type="email" required
                        class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="you@example.com" />
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input v-model="password" id="password" name="password" type="password" required minlength="6"
                        class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Create a password (min 6 characters)" />
                </div>

                <!-- Error Message Display -->
                <p v-if="authError" class="text-sm text-red-600">{{ authError }}</p>

                <div>
                    <button type="submit" :disabled="isLoading"
                        class="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isLoading ? 'Registering...' : 'Create Account' }}
                    </button>
                </div>
            </form>
            <p class="text-sm text-center text-gray-600">
                Already have an account?
                <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
                    Login
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore'; // Adjust path
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');

const isLoading = computed(() => authStore.isLoading);
const authError = computed(() => authStore.authError);

const handleRegister = async () => {
    if (!username.value || !email.value || !password.value) {
        authStore.setError("Please fill in all fields.");
        return;
    }
    if (password.value.length < 6) {
        authStore.setError("Password must be at least 6 characters long.");
        return;
    }

    const success = await authStore.register({
        username: username.value,
        email: email.value,
        password: password.value,
    });

    if (success) {
        // Optionally redirect to login or show a success message
        alert('Registration successful! Please log in.'); // Simple feedback for now
        router.push('/login');
    }
    // Error handling is done within the authStore.register action
};
</script>