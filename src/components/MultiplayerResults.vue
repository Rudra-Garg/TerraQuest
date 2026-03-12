<template>
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/95 backdrop-blur-md"
    >
        <!-- Background grid -->
        <div
            class="absolute inset-0 opacity-[0.02] pointer-events-none"
            style="
                background-image:
                    linear-gradient(
                        rgba(255, 255, 255, 1) 1px,
                        transparent 1px
                    ),
                    linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 1) 1px,
                        transparent 1px
                    );
                background-size: 60px 60px;
            "
        ></div>

        <div
            class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
            <!-- Header -->
            <div class="text-center mb-8">
                <div
                    class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D36040]/10 border border-[#D36040]/20 mb-4"
                >
                    <svg
                        class="w-7 h-7 text-[#D36040]"
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
                <h2 class="text-2xl font-semibold text-white tracking-tight">
                    Game Over
                </h2>
                <p class="text-sm text-white/35 mt-1.5">
                    Final standings for this match
                </p>
            </div>

            <!-- Final standings -->
            <div
                class="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden mb-4"
            >
                <div class="px-6 py-4 border-b border-white/[0.06]">
                    <h3 class="text-sm font-medium text-white/60">
                        Final Standings
                    </h3>
                </div>

                <div class="divide-y divide-white/[0.04]">
                    <div
                        v-for="(player, index) in sortedPlayers"
                        :key="player.userId"
                        class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                        :class="{
                            'bg-[#D36040]/[0.04]': isCurrentUser(player.userId),
                        }"
                    >
                        <!-- Rank -->
                        <div class="w-8 flex-shrink-0 text-center">
                            <span v-if="index === 0" class="text-lg">🏆</span>
                            <span v-else-if="index === 1" class="text-lg"
                                >🥈</span
                            >
                            <span v-else-if="index === 2" class="text-lg"
                                >🥉</span
                            >
                            <span
                                v-else
                                class="text-sm font-mono text-white/30"
                                >{{ index + 1 }}</span
                            >
                        </div>

                        <!-- Avatar + name -->
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <div
                                class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 select-none"
                                :class="
                                    index === 0
                                        ? 'bg-[#D36040]/15 border border-[#D36040]/30 text-[#D36040]'
                                        : isCurrentUser(player.userId)
                                          ? 'bg-white/[0.08] border border-[#D36040]/20 text-white/70'
                                          : 'bg-white/[0.06] border border-white/[0.08] text-white/50'
                                "
                            >
                                {{
                                    player.username?.charAt(0)?.toUpperCase() ||
                                    "?"
                                }}
                            </div>
                            <div class="min-w-0">
                                <p
                                    class="text-sm font-medium text-white truncate"
                                >
                                    {{ player.username }}
                                    <span
                                        v-if="isCurrentUser(player.userId)"
                                        class="ml-2 text-[10px] text-[#D36040] font-medium"
                                        >You</span
                                    >
                                </p>
                            </div>
                        </div>

                        <!-- Best round -->
                        <div class="text-right hidden sm:block">
                            <p class="text-xs text-white/25 mb-0.5">Best</p>
                            <p class="text-sm font-mono text-white/60">
                                {{
                                    getBestRoundScore(
                                        player.userId,
                                    ).toLocaleString()
                                }}
                            </p>
                        </div>

                        <!-- Total score -->
                        <div class="text-right">
                            <p class="text-xs text-white/25 mb-0.5">Total</p>
                            <p
                                class="text-base font-semibold font-mono tabular-nums"
                                :class="
                                    index === 0
                                        ? 'text-[#D36040]'
                                        : 'text-white/80'
                                "
                            >
                                {{
                                    getPlayerTotalScore(
                                        player.userId,
                                    ).toLocaleString()
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Round-by-round breakdown -->
            <div
                class="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden mb-6"
            >
                <div class="px-6 py-4 border-b border-white/[0.06]">
                    <h3 class="text-sm font-medium text-white/60">
                        Round Breakdown
                    </h3>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b border-white/[0.05]">
                                <th
                                    class="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-wider"
                                >
                                    Player
                                </th>
                                <th
                                    v-for="round in roundNumbers"
                                    :key="round"
                                    class="px-4 py-3 text-xs font-medium text-white/30 uppercase tracking-wider text-center"
                                >
                                    R{{ round }}
                                </th>
                                <th
                                    class="px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-wider text-right"
                                >
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/[0.03]">
                            <tr
                                v-for="player in sortedPlayers"
                                :key="player.userId"
                                class="hover:bg-white/[0.02] transition-colors"
                                :class="{
                                    'bg-[#D36040]/[0.03]': isCurrentUser(
                                        player.userId,
                                    ),
                                }"
                            >
                                <td class="px-6 py-3.5">
                                    <div class="flex items-center gap-2.5">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-xs font-medium text-white/40 select-none flex-shrink-0"
                                        >
                                            {{
                                                player.username
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "?"
                                            }}
                                        </div>
                                        <span
                                            class="text-sm text-white/70 truncate max-w-[100px]"
                                        >
                                            {{ player.username }}
                                        </span>
                                        <span
                                            v-if="isCurrentUser(player.userId)"
                                            class="text-[10px] text-[#D36040] font-medium flex-shrink-0"
                                            >You</span
                                        >
                                    </div>
                                </td>
                                <td
                                    v-for="round in roundNumbers"
                                    :key="round"
                                    class="px-4 py-3.5 text-center"
                                >
                                    <span
                                        class="text-sm font-mono tabular-nums"
                                        :class="
                                            getRoundScore(
                                                player.userId,
                                                round - 1,
                                            ) === '-'
                                                ? 'text-white/20'
                                                : 'text-white/60'
                                        "
                                    >
                                        {{
                                            getRoundScore(
                                                player.userId,
                                                round - 1,
                                            )
                                        }}
                                    </span>
                                </td>
                                <td class="px-6 py-3.5 text-right">
                                    <span
                                        class="text-sm font-semibold font-mono tabular-nums text-white/80"
                                    >
                                        {{
                                            getPlayerTotalScore(
                                                player.userId,
                                            ).toLocaleString()
                                        }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
                <button
                    @click="playAgain"
                    class="flex-1 flex items-center justify-center gap-2 py-3 bg-[#D36040] hover:bg-[#b04a2e] text-white font-medium rounded-xl transition-all text-sm shadow-lg shadow-[#D36040]/10 hover:shadow-[#D36040]/20"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Play Again
                </button>
                <button
                    @click="returnHome"
                    class="flex-1 flex items-center justify-center gap-2 py-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-white/70 hover:text-white font-medium rounded-xl transition-all text-sm"
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    Return Home
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMultiplayerStore } from "../stores/MultiplayerStore";
import { useGameStore } from "../stores/GameStore";
import { useAuthStore } from "../stores/AuthStore";

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const gameStore = useGameStore();
const authStore = useAuthStore();

const roundNumbers = computed(() => {
    const rounds = [];
    for (let i = 1; i <= multiplayerStore.roundsTotal; i++) {
        rounds.push(i);
    }
    return rounds;
});

const sortedPlayers = computed(() => {
    return [...multiplayerStore.players].sort((a, b) => {
        return getPlayerTotalScore(b.userId) - getPlayerTotalScore(a.userId);
    });
});

function isCurrentUser(userId) {
    return userId === authStore.userProfile?.id;
}

function getRoundScore(userId, roundIndex) {
    const results = multiplayerStore.playerRoundResults[userId];
    if (!results || !results[roundIndex]) return "-";
    const score = results[roundIndex].score;
    return typeof score === "number" ? score.toLocaleString() : 0;
}

function getPlayerTotalScore(userId) {
    const player = multiplayerStore.players.find((p) => p.userId === userId);
    if (player && typeof player.totalScore === "number")
        return player.totalScore;

    const results = multiplayerStore.playerRoundResults[userId];
    if (!results) return 0;

    let total = 0;
    for (const round of results) {
        if (round && typeof round.score === "number") total += round.score;
    }
    return total;
}

function getBestRoundScore(userId) {
    const results = multiplayerStore.playerRoundResults[userId];
    if (!results) return 0;

    let best = 0;
    for (const round of results) {
        if (round && typeof round.score === "number" && round.score > best)
            best = round.score;
    }
    return best;
}

function playAgain() {
    router.push("/multiplayer/lobby");
}

function returnHome() {
    multiplayerStore.leaveGame();
    router.push("/");
}
</script>
