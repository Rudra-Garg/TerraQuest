<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.userProfile?.id);

// Pagination & filtering state
const currentPage = ref(1);
const pageSize = 10;
const activeTab = ref('all-time');
const isLoading = ref(true);

// Mock leaderboard data
const mockLeaderboard = [
    {
        id: 1,
        username: 'GeoMaster',
        gamesPlayed: 245,
        avgScore: '4,721',
        bestScore: '24,950',
        totalPoints: 1157645,
        joinDate: '2024-01-15'
    },
    {
        id: 2,
        username: 'WorldExplorer',
        gamesPlayed: 183,
        avgScore: '4,532',
        bestScore: '24,800',
        totalPoints: 829356,
        joinDate: '2024-02-03'
    },
    {
        id: 3,
        username: 'MapWizard',
        gamesPlayed: 201,
        avgScore: '4,120',
        bestScore: '24,100',
        totalPoints: 828120,
        joinDate: '2024-01-20'
    },
    {
        id: 4,
        username: 'TravellerPro',
        gamesPlayed: 142,
        avgScore: '3,950',
        bestScore: '23,400',
        totalPoints: 560900,
        joinDate: '2024-03-05'
    },
    {
        id: 5,
        username: 'GeographyNerd',
        gamesPlayed: 121,
        avgScore: '3,840',
        bestScore: '23,100',
        totalPoints: 464640,
        joinDate: '2024-03-12'
    },
    {
        id: 6,
        username: 'AtlasHero',
        gamesPlayed: 98,
        avgScore: '3,760',
        bestScore: '22,800',
        totalPoints: 368480,
        joinDate: '2024-03-18'
    },
    {
        id: 7,
        username: 'CurrentUser', // This would be your logged-in user
        gamesPlayed: 78,
        avgScore: '3,480',
        bestScore: '22,100',
        totalPoints: 271440,
        isCurrentUser: true,
        joinDate: '2024-03-20'
    },
    {
        id: 8,
        username: 'GlobeTrotter',
        gamesPlayed: 65,
        avgScore: '3,350',
        bestScore: '21,500',
        totalPoints: 217750,
        joinDate: '2024-03-22'
    },
    {
        id: 9,
        username: 'LandmarksExpert',
        gamesPlayed: 52,
        avgScore: '3,240',
        bestScore: '20,800',
        totalPoints: 168480,
        joinDate: '2024-03-25'
    },
    {
        id: 10,
        username: 'ContinentCrusher',
        gamesPlayed: 37,
        avgScore: '3,120',
        bestScore: '19,950',
        totalPoints: 115440,
        joinDate: '2024-04-01'
    },
    {
        id: 11,
        username: 'MapManiac',
        gamesPlayed: 25,
        avgScore: '2,980',
        bestScore: '18,300',
        totalPoints: 74500,
        joinDate: '2024-04-05'
    },
    {
        id: 12,
        username: 'BorderCrosser',
        gamesPlayed: 18,
        avgScore: '2,750',
        bestScore: '17,100',
        totalPoints: 49500,
        joinDate: '2024-04-08'
    }
];

// Computed properties
const players = computed(() => {
    // In a real implementation, you would fetch from API based on activeTab
    return mockLeaderboard;
});

const topPlayers = computed(() => {
    return players.value.slice(0, 3);
});

const otherPlayers = computed(() => {
    return players.value.slice(3);
});

const totalPages = computed(() => {
    return Math.ceil(players.value.length / pageSize);
});

// Format date helper function
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

// Fetch leaderboard data 
async function fetchLeaderboard() {
    isLoading.value = true;

    try {
        // In a real implementation, this would be an API call:
        // const response = await leaderboardService.getLeaderboard(activeTab.value, currentPage.value, pageSize);
        // Process API response...

        // Simulate API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // This would be set with API data
        // leaderboardData.value = response.data;

    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    } finally {
        isLoading.value = false;
    }
}

// Watch for tab changes to refetch data
watch(activeTab, () => {
    currentPage.value = 1; // Reset to first page when changing tabs
    fetchLeaderboard();
});

// Watch for page changes
watch(currentPage, () => {
    fetchLeaderboard();
});

// Initial data load
onMounted(() => {
    fetchLeaderboard();
});
</script>

<template>
    <div class="py-12">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">Global Leaderboard</h1>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    See how you rank against the world's best geography enthusiasts. Can you make it to the top?
                </p>
            </div>

            <!-- Leaderboard Tabs -->
            <div class="mb-8 flex justify-center">
                <div class="inline-flex rounded-md shadow-sm" role="group">
                    <button type="button" @click="activeTab = 'all-time'" :class="[
                        'px-5 py-2.5 text-sm font-medium rounded-l-lg',
                        activeTab === 'all-time' ?
                            'bg-blue-600 text-white hover:bg-blue-700' :
                            'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    ]">
                        All-Time
                    </button>
                    <button type="button" @click="activeTab = 'monthly'" :class="[
                        'px-5 py-2.5 text-sm font-medium',
                        activeTab === 'monthly' ?
                            'bg-blue-600 text-white hover:bg-blue-700' :
                            'bg-white text-gray-700 hover:bg-gray-100 border-y border-gray-300'
                    ]">
                        Monthly
                    </button>
                    <button type="button" @click="activeTab = 'weekly'" :class="[
                        'px-5 py-2.5 text-sm font-medium rounded-r-lg',
                        activeTab === 'weekly' ?
                            'bg-blue-600 text-white hover:bg-blue-700' :
                            'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    ]">
                        Weekly
                    </button>
                </div>
            </div>

            <!-- Leaderboard Table -->
            <div class="bg-white shadow-xl rounded-lg overflow-hidden mb-8 relative">
                <!-- Loading Overlay -->
                <div v-if="isLoading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                    <div class="flex flex-col items-center">
                        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <p class="text-gray-600">Loading leaderboard...</p>
                    </div>
                </div>

                <table class="w-full table-auto">
                    <thead class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                            <th class="px-4 py-4 text-left w-14">#</th>
                            <th class="px-4 py-4 text-left">Player</th>
                            <th class="px-4 py-4 text-center">Games Played</th>
                            <th class="px-4 py-4 text-center">Avg. Score</th>
                            <th class="px-4 py-4 text-center">Best Score</th>
                            <th class="px-4 py-4 text-center">Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Top 3 Players (Gold, Silver, Bronze) -->
                        <tr v-for="(player, index) in topPlayers" :key="player.id"
                            class="border-b hover:bg-gray-50 transition-colors duration-150">
                            <td class="px-4 py-4">
                                <div class="flex justify-center items-center w-8 h-8 rounded-full" :class="[
                                    index === 0 ? 'bg-yellow-400' :
                                        index === 1 ? 'bg-gray-300' :
                                            index === 2 ? 'bg-amber-700' : ''
                                ]">
                                    <span class="font-bold text-gray-900">{{ index + 1 }}</span>
                                </div>
                            </td>
                            <td class="px-4 py-4">
                                <div class="flex items-center">
                                    <div
                                        class="w-10 h-10 mr-3 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-bold">
                                        {{ player.username.substring(0, 2).toUpperCase() }}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-900">{{ player.username }}</div>
                                        <div class="text-xs text-gray-500">Joined {{ formatDate(player.joinDate) }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-4 text-center">{{ player.gamesPlayed }}</td>
                            <td class="px-4 py-4 text-center">{{ player.avgScore }}</td>
                            <td class="px-4 py-4 text-center">{{ player.bestScore }}</td>
                            <td class="px-4 py-4 text-center">
                                <span class="font-bold">{{ player.totalPoints.toLocaleString() }}</span>
                            </td>
                        </tr>

                        <!-- Other Players -->
                        <tr v-for="(player, index) in otherPlayers" :key="player.id"
                            class="border-b hover:bg-gray-50 transition-colors duration-150"
                            :class="{ 'bg-blue-50': player.isCurrentUser }">
                            <td class="px-4 py-4 text-center">{{ index + 4 }}</td>
                            <td class="px-4 py-4">
                                <div class="flex items-center">
                                    <div
                                        class="w-10 h-10 mr-3 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full font-bold">
                                        {{ player.username.substring(0, 2).toUpperCase() }}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-900">
                                            {{ player.username }}
                                            <span v-if="player.isCurrentUser"
                                                class="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">You</span>
                                        </div>
                                        <div class="text-xs text-gray-500">Joined {{ formatDate(player.joinDate) }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-4 text-center">{{ player.gamesPlayed }}</td>
                            <td class="px-4 py-4 text-center">{{ player.avgScore }}</td>
                            <td class="px-4 py-4 text-center">{{ player.bestScore }}</td>
                            <td class="px-4 py-4 text-center">{{ player.totalPoints.toLocaleString() }}</td>
                        </tr>

                        <!-- No Data State -->
                        <tr v-if="!isLoading && players.length === 0">
                            <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-400"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p class="text-lg font-medium mb-1">No leaderboard data available yet</p>
                                <p>Be the first to play and set some records!</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex justify-center">
                <nav aria-label="Page navigation">
                    <ul class="inline-flex -space-x-px">
                        <li>
                            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
                                class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                        </li>
                        <li v-for="page in totalPages" :key="page">
                            <button @click="currentPage = page" :class="[
                                'px-3 py-2 leading-tight border border-gray-300',
                                currentPage === page ?
                                    'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-300' :
                                    'text-gray-500 bg-white hover:bg-gray-100'
                            ]">
                                {{ page }}
                            </button>
                        </li>
                        <li>
                            <button @click="currentPage = Math.min(totalPages, currentPage + 1)"
                                :disabled="currentPage === totalPages"
                                class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Add any additional scoped styles here if needed */
</style>