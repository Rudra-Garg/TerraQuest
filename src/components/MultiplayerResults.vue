<template>
  <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Game Results</h2>
    
    <!-- Final Standings -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Final Standings</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Score</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Best Round</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            <tr v-for="(player, index) in sortedPlayers" :key="player.userId" 
              :class="{'bg-yellow-50 dark:bg-yellow-900/20': isCurrentUser(player.userId)}">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ index + 1 }}
                <span v-if="index === 0" class="ml-1">🏆</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {{ player.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="ml-2">{{ player.username }}</span>
                  <span v-if="isCurrentUser(player.userId)" class="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {{ getPlayerTotalScore(player.userId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {{ getBestRoundScore(player.userId) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Round by Round -->
    <div>
      <h3 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Round by Round</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
              <th v-for="round in roundNumbers" :key="round" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Round {{ round }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            <tr v-for="player in sortedPlayers" :key="player.userId" 
              :class="{'bg-yellow-50 dark:bg-yellow-900/20': isCurrentUser(player.userId)}">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ player.username }}
              </td>
              <td v-for="round in roundNumbers" :key="round" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {{ getRoundScore(player.userId, round - 1) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="mt-8 flex justify-center space-x-4">
      <button @click="playAgain" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">
        Play Again
      </button>
      <button @click="returnHome" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-md">
        Return to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMultiplayerStore } from '../stores/MultiplayerStore';
import { useGameStore } from '../stores/GameStore';
import { useAuthStore } from '../stores/AuthStore';

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const gameStore = useGameStore();
const authStore = useAuthStore();

// Get round numbers (1-based)
const roundNumbers = computed(() => {
  const rounds = [];
  for (let i = 1; i <= gameStore.MAX_ROUNDS; i++) {
    rounds.push(i);
  }
  return rounds;
});

// Sort players by total score (descending)
const sortedPlayers = computed(() => {
  return [...multiplayerStore.players].sort((a, b) => {
    return getPlayerTotalScore(b.userId) - getPlayerTotalScore(a.userId);
  });
});

// Check if player is the current user
function isCurrentUser(userId) {
  return userId === authStore.userProfile?.id;
}

// Get player's score for a specific round (0-based round index)
function getRoundScore(userId, roundIndex) {
  const results = multiplayerStore.playerResults[userId];
  if (!results || !results[roundIndex]) return '-';
  return results[roundIndex].score || 0;
}

// Get player's total score
function getPlayerTotalScore(userId) {
  const results = multiplayerStore.playerResults[userId];
  if (!results) return 0;
  
  let total = 0;
  for (const round of results) {
    if (round && round.score) {
      total += round.score;
    }
  }
  return total;
}

// Get player's best round score
function getBestRoundScore(userId) {
  const results = multiplayerStore.playerResults[userId];
  if (!results) return 0;
  
  let best = 0;
  for (const round of results) {
    if (round && round.score && round.score > best) {
      best = round.score;
    }
  }
  return best;
}

// Play again handler
function playAgain() {
  // Return to lobby
  router.push('/multiplayer/lobby');
}

// Return to home handler
function returnHome() {
  multiplayerStore.leaveGame();
  router.push('/');
}
</script> 