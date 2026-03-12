<template>
    <div class="relative w-full h-screen overflow-hidden bg-[#09090B]">
        <!-- ═══════════════════════════════════════════════
             1. STREET VIEW (fullscreen background)
        ═══════════════════════════════════════════════ -->
        <div class="absolute inset-0 z-0">
            <StreetViewDisplay
                v-if="currentLocation && !gameStore.isGameOver"
                :key="`${gameStore.currentRoundNumber}-${currentLocation?.lat}-${currentLocation?.lng}`"
                :location="currentLocation"
                class="w-full h-full"
            />
            <!-- Loading round location -->
            <div
                v-else-if="
                    !currentLocation &&
                    gameStore.gameId &&
                    !gameStore.isGameOver &&
                    gameStore.currentRoundNumber > 0
                "
                class="w-full h-full bg-[#09090B] flex items-center justify-center"
            >
                <div class="flex flex-col items-center gap-4">
                    <svg
                        class="animate-spin h-8 w-8 text-[#D36040]"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-20"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="2"
                        />
                        <path
                            class="opacity-80"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <p class="text-xs text-white/30 tracking-[0.2em] uppercase">
                        Loading Round {{ gameStore.currentRoundNumber }}…
                    </p>
                </div>
            </div>
            <!-- Waiting for game to start -->
            <div
                v-else-if="
                    !gameStore.gameId || gameStore.currentRoundNumber === 0
                "
                class="w-full h-full bg-[#09090B] flex flex-col items-center justify-center gap-4"
            >
                <div
                    class="w-px h-8 bg-[#D36040]/50 animate-[pulse_2s_ease-in-out_infinite]"
                ></div>
                <p class="text-xs text-white/30 tracking-[0.2em] uppercase">
                    Waiting for host…
                </p>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             2. HUD — TOP BAR (visible during active game)
        ═══════════════════════════════════════════════ -->
        <div
            v-if="gameStore.gameId && !gameStore.isGameOver && !isMapFullscreen"
            class="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        >
            <div
                class="flex flex-wrap items-start justify-between p-4 md:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent gap-4"
            >
                <!-- Left: Score -->
                <div
                    class="bg-black/50 backdrop-blur-md border border-white/[0.1] rounded-xl px-4 py-2.5 pointer-events-auto shadow-xl"
                >
                    <p
                        class="text-[10px] text-white/35 uppercase tracking-widest font-medium leading-none mb-1"
                    >
                        Score
                    </p>
                    <p
                        class="text-xl font-light text-white tabular-nums leading-none"
                    >
                        {{ getCurrentUserSession?.totalScore ?? 0 }}
                    </p>
                </div>

                <!-- Center: Timer & Round Dots -->
                <div class="flex flex-col items-center gap-3">
                    <!-- Timer -->
                    <div
                        v-if="
                            isRoundTimerActive &&
                            roundTimeRemaining > 0 &&
                            !multiplayerStore.isWaitingForRoundEnd &&
                            !showRoundResults
                        "
                        class="bg-black/50 backdrop-blur-md border border-white/[0.1] rounded-xl px-5 py-2 pointer-events-auto shadow-xl text-center min-w-[120px]"
                    >
                        <p
                            v-if="
                                !multiplayerStore.firstPlayerGuessedInRound &&
                                gameStore.isRoundActive
                            "
                            class="text-[9px] text-[#D36040] uppercase tracking-widest font-medium mb-0.5 animate-pulse"
                        >
                            Waiting for guess
                        </p>
                        <p
                            v-else-if="roundTimeRemaining > 0"
                            class="text-[9px] text-white/40 uppercase tracking-widest font-medium mb-0.5"
                        >
                            Time left
                        </p>
                        <p
                            class="text-xl font-mono text-white tracking-wider leading-none"
                            :class="{
                                'animate-pulse !text-red-400':
                                    roundTimeRemaining <= 10 &&
                                    roundTimeRemaining > 0,
                            }"
                        >
                            {{ formatTime(roundTimeRemaining) }}
                        </p>
                    </div>

                    <!-- Round dots -->
                    <div class="flex items-center gap-2 pointer-events-auto">
                        <div
                            v-for="round in gameStore.MAX_ROUNDS"
                            :key="round"
                            class="transition-all duration-300 rounded-full"
                            :class="[
                                round < gameStore.currentRoundNumber
                                    ? 'w-2 h-2 bg-white/60'
                                    : round === gameStore.currentRoundNumber
                                      ? 'w-3 h-3 bg-[#D36040] shadow-lg shadow-[#D36040]/50'
                                      : 'w-2 h-2 bg-white/15',
                            ]"
                        />
                    </div>
                </div>

                <!-- Right: Game Code & Settings -->
                <div class="flex items-start gap-3 pointer-events-auto">
                    <!-- Game code -->
                    <div
                        class="hidden sm:block bg-black/50 backdrop-blur-md border border-white/[0.1] rounded-xl px-4 py-2.5 shadow-xl text-right"
                    >
                        <p
                            class="text-[10px] text-white/35 uppercase tracking-widest font-medium leading-none mb-1"
                        >
                            Room Code
                        </p>
                        <p
                            class="text-sm font-mono text-white tracking-widest leading-none"
                        >
                            {{ multiplayerStore.gameCode }}
                        </p>
                    </div>

                    <!-- Settings -->
                    <div class="relative">
                        <button
                            @click="toggleSettings"
                            class="bg-black/50 backdrop-blur-md border border-white/[0.1] rounded-xl p-2.5 text-white/50 hover:text-white hover:bg-black/70 transition-all shadow-xl"
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
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </button>
                        <!-- Settings Dropdown -->
                        <div
                            v-if="showSettings"
                            class="absolute top-12 right-0 bg-[#111117]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-2xl p-4 min-w-[200px] z-50 pointer-events-auto"
                        >
                            <p
                                class="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-3"
                            >
                                Map Settings
                            </p>
                            <div class="space-y-3">
                                <label
                                    class="flex items-center gap-3 text-sm text-white/70 hover:text-white cursor-pointer transition-colors"
                                    @click.stop
                                >
                                    <input
                                        type="checkbox"
                                        v-model="mapSettings.showCoordinates"
                                        class="accent-[#D36040] w-3.5 h-3.5"
                                        @click.stop
                                    />
                                    Show Coordinates
                                </label>
                                <label
                                    class="flex items-center gap-3 text-sm text-white/70 hover:text-white cursor-pointer transition-colors"
                                    @click.stop
                                >
                                    <input
                                        type="checkbox"
                                        v-model="mapSettings.enableZoom"
                                        class="accent-[#D36040] w-3.5 h-3.5"
                                        @click.stop
                                    />
                                    Enable Zoom
                                </label>
                                <label
                                    class="flex items-center gap-3 text-sm text-white/70 hover:text-white cursor-pointer transition-colors"
                                    @click.stop
                                >
                                    <input
                                        type="checkbox"
                                        v-model="mapSettings.darkMode"
                                        class="accent-[#D36040] w-3.5 h-3.5"
                                        @click.stop
                                    />
                                    Dark Map Theme
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             3. PLAYER STATUS BAR (below top bar)
        ═══════════════════════════════════════════════ -->
        <div
            v-if="gameStore.gameId && !gameStore.isGameOver && !isMapFullscreen"
            class="absolute top-[88px] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl xl:max-w-5xl z-10 pointer-events-auto"
        >
            <div
                class="flex flex-wrap justify-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-lg"
            >
                <div
                    v-for="player in multiplayerStore.players"
                    :key="player.userId"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300"
                    :class="getPlayerStatusClass(player)"
                >
                    <span
                        class="text-xs font-medium truncate max-w-[100px]"
                        :title="player.username"
                        >{{ player.username }}</span
                    >
                    <span class="text-[10px] opacity-70 font-mono"
                        >{{ player.currentHealth }}HP</span
                    >
                    <!-- Guessed checkmark -->
                    <svg
                        v-if="hasPlayerSubmittedGuessThisRound(player.userId)"
                        class="w-3.5 h-3.5 opacity-90"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <!-- Waiting indicator -->
                    <span
                        v-else-if="
                            gameStore.isRoundActive &&
                            player.status === 'active' &&
                            !multiplayerStore.isWaitingForRoundEnd &&
                            !showRoundResults
                        "
                        class="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse ml-1"
                    ></span>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             4. MAP & RESULT OVERLAY
        ═══════════════════════════════════════════════ -->
        <div
            v-if="gameStore.gameId && !gameStore.isGameOver"
            class="map-container group absolute transition-all duration-500 ease-in-out overflow-hidden"
            :class="{
                'inset-0 z-40 rounded-none border-0':
                    isMapFullscreen || showRoundResults,
                'bottom-24 right-5 w-52 h-40 md:w-64 md:h-48 z-20 rounded-xl border border-white/20 shadow-2xl shadow-black/50 hover:w-[38vw] hover:h-[35vh] hover:shadow-black/70':
                    !isMapFullscreen && !showRoundResults,
            }"
        >
            <MapDisplay
                @guess-made="handleMapGuess"
                ref="mapDisplayRef"
                :key="`map-${gameStore.currentRoundNumber}`"
                :round-active="
                    gameStore.isRoundActive &&
                    !multiplayerStore.isWaitingForRoundEnd &&
                    !showRoundResults
                "
                :submitted="showRoundResults"
                :actual-location="
                    showRoundResults
                        ? multiplayerStore.currentRoundActualLocation
                        : null
                "
                :guess-location="
                    showRoundResults ? getCurrentUserRoundResult?.guess : null
                "
                class="w-full h-full cursor-crosshair"
            />

            <!-- Expand hint (minimap only) -->
            <div
                v-if="!isMapFullscreen && !showRoundResults"
                class="absolute bottom-2 left-2 text-[9px] text-white/40 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none group-hover:opacity-0 transition-opacity"
            >
                Hover to expand
            </div>

            <!-- ── Round Results Overlay (Fullscreen Map) ── -->
            <div
                v-if="showRoundResults"
                class="absolute top-4 left-4 bg-[#111117]/95 backdrop-blur-xl border border-white/[0.1] text-white p-5 rounded-2xl shadow-2xl z-50 w-72 max-h-[80vh] flex flex-col"
            >
                <div class="mb-4">
                    <p
                        class="text-[10px] text-[#D36040] uppercase tracking-widest font-medium mb-2"
                    >
                        Round {{ gameStore.currentRoundNumber }} Results
                    </p>
                    <p class="text-xs text-white/60 mb-0.5">
                        Winner:
                        <span class="text-white font-medium"
                            >{{ roundWinnerUsername }}
                        </span>
                        ({{ roundWinnerScore }} pts)
                    </p>
                    <p class="text-[10px] text-white/40 font-mono">
                        Multiplier:
                        {{
                            multiplayerStore.currentRoundMultiplier.toFixed(1)
                        }}x
                    </p>
                </div>

                <div class="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    <div
                        v-for="playerResult in detailedPlayerResultsForCurrentRound"
                        :key="playerResult.userId"
                        class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <p
                                class="text-sm font-medium truncate"
                                :class="
                                    playerResult.userId ===
                                    authStore.userProfile?.id
                                        ? 'text-[#D36040]'
                                        : 'text-white/90'
                                "
                            >
                                {{ playerResult.username }}
                            </p>
                            <span class="text-xs font-mono text-white/70"
                                >{{ playerResult.roundScore }} pts</span
                            >
                        </div>
                        <div
                            class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]"
                        >
                            <p class="text-white/40 uppercase tracking-wider">
                                Distance
                            </p>
                            <p class="text-right text-white/80 tabular-nums">
                                {{
                                    playerResult.distanceKm < 0
                                        ? "N/A"
                                        : playerResult.distanceKm.toFixed(1) +
                                          " km"
                                }}
                            </p>

                            <p class="text-white/40 uppercase tracking-wider">
                                Damage
                            </p>
                            <p class="text-right text-red-400 tabular-nums">
                                -{{ playerResult.damageTaken }}
                            </p>

                            <p class="text-white/40 uppercase tracking-wider">
                                Health
                            </p>
                            <p class="text-right text-white/80 tabular-nums">
                                {{ playerResult.currentHealth }} /
                                {{ multiplayerStore.initialHealth }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Host Next Round / Finish Game Controls -->
            <div
                v-if="showRoundResults"
                class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50"
            >
                <button
                    v-if="multiplayerStore.isHost"
                    @click="handleHostProceed"
                    :disabled="!multiplayerStore.isHost || isAdvancing"
                    class="flex items-center gap-2.5 px-7 py-3 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-[#D36040]/50 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#D36040]/30 text-sm"
                >
                    <template v-if="isAdvancing">
                        <svg
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
                        Loading…
                    </template>
                    <template v-else>
                        {{ isLastRound ? "View Final Results" : "Next Round" }}
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
                                :d="
                                    isLastRound
                                        ? 'M5 13l4 4L19 7'
                                        : 'M13 7l5 5m0 0l-5 5m5-5H6'
                                "
                            />
                        </svg>
                    </template>
                </button>
                <div
                    v-else-if="showRoundResults && !gameStore.isGameOver"
                    class="px-6 py-2.5 bg-black/60 backdrop-blur-md border border-white/[0.1] rounded-full text-xs text-white/50 tracking-wider uppercase"
                >
                    Waiting for host…
                </div>
            </div>

            <!-- "Waiting for others" Overlay (Before round ends) -->
            <div
                v-if="
                    multiplayerStore.isWaitingForRoundEnd && !showRoundResults
                "
                class="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4"
            >
                <svg
                    class="animate-spin h-8 w-8 text-[#D36040] mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        class="opacity-20"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="2"
                    ></circle>
                    <path
                        class="opacity-80"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p class="text-sm font-medium text-white mb-1">
                    Guess submitted
                </p>
                <p class="text-xs text-white/40">
                    Waiting for others or timer…
                </p>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             5. BOTTOM CONTROLS (Submit Guess)
        ═══════════════════════════════════════════════ -->
        <div
            v-if="
                gameStore.gameId &&
                !gameStore.isGameOver &&
                !isMapFullscreen &&
                !multiplayerStore.isWaitingForRoundEnd &&
                !showRoundResults
            "
            class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
            <p
                v-if="gameStore.currentGuess"
                class="text-[11px] font-mono text-white/50 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/[0.08]"
            >
                {{ gameStore.currentGuess.lat.toFixed(4) }}°,
                {{ gameStore.currentGuess.lng.toFixed(4) }}°
            </p>

            <button
                @click="submitGuessHandler"
                :disabled="
                    !gameStore.currentGuess ||
                    !gameStore.isRoundActive ||
                    multiplayerStore.isWaitingForRoundEnd ||
                    showRoundResults
                "
                class="flex items-center gap-3 px-10 py-3.5 font-medium rounded-full transition-all text-sm shadow-2xl"
                :class="
                    gameStore.currentGuess && gameStore.isRoundActive
                        ? 'bg-[#D36040] hover:bg-[#b04a2e] text-white shadow-[#D36040]/30 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-black/50 backdrop-blur-md border border-white/[0.1] text-white/30 cursor-not-allowed'
                "
            >
                <svg
                    v-if="gameStore.currentGuess"
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
                <svg
                    v-else
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                    />
                </svg>
                {{
                    gameStore.currentGuess
                        ? "Submit Guess"
                        : "Click the map to place a pin"
                }}
            </button>
        </div>

        <!-- ═══════════════════════════════════════════════
             6. GAME OVER SCREEN
        ═══════════════════════════════════════════════ -->
        <div
            v-if="gameStore.isGameOver && multiplayerStore.gameId"
            class="absolute inset-0 bg-[#09090B] flex items-center justify-center z-50 overflow-auto"
        >
            <MultiplayerResults />
        </div>

        <!-- ═══════════════════════════════════════════════
             7. ERROR TOAST
        ═══════════════════════════════════════════════ -->
        <transition name="toast">
            <div
                v-if="multiplayerStore.error"
                class="fixed top-5 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-full px-4"
            >
                <div
                    class="flex items-start gap-3 px-4 py-3.5 bg-[#111117] border border-red-500/25 rounded-xl shadow-2xl"
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
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white">Error</p>
                        <p class="text-sm text-white/50 mt-0.5">
                            {{ multiplayerStore.error }}
                        </p>
                    </div>
                    <button
                        @click="multiplayerStore.error = null"
                        class="text-white/30 hover:text-white transition-colors flex-shrink-0 mt-0.5"
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/GameStore";
import { useMultiplayerStore } from "../stores/MultiplayerStore";
import { useAuthStore } from "../stores/AuthStore";
import StreetViewDisplay from "../components/StreetViewDisplay.vue";
import MapDisplay from "../components/MapDisplay.vue";
import MultiplayerResults from "../components/MultiplayerResults.vue";

const router = useRouter();
const gameStore = useGameStore();
const multiplayerStore = useMultiplayerStore();
const authStore = useAuthStore();
const mapDisplayRef = ref(null);
const isMapFullscreen = ref(false);
const isAdvancing = ref(false);

const showSettings = ref(false);
const mapSettings = ref({
    showCoordinates: false,
    enableZoom: true,
    darkMode: false,
});

watch(
    () => mapSettings.value,
    (newSettings) => {
        if (mapDisplayRef.value) {
            mapDisplayRef.value.updateMapSettings(newSettings);
        }
    },
    { deep: true },
);

// --- Timer State ---
const roundTimeRemaining = ref(0);
const isRoundTimerActive = ref(false);
let roundTimerInterval = null;

// --- Computed Properties ---
const showRoundResults = computed(
    () => multiplayerStore.showRoundResultsSummary,
);
const isLastRound = computed(
    () => gameStore.currentRoundNumber >= gameStore.MAX_ROUNDS,
);
const currentLocation = computed(() => gameStore.getCurrentLocation);

const getCurrentUserSession = computed(() => {
    const currentUserId = authStore.userProfile?.id;
    return currentUserId
        ? multiplayerStore.players.find((p) => p.userId === currentUserId)
        : null;
});

const getCurrentUserRoundResult = computed(() => {
    const currentRoundNum = gameStore.currentRoundNumber;
    const userId = authStore.userProfile?.id;
    if (
        !userId ||
        currentRoundNum <= 0 ||
        !multiplayerStore.playerRoundResults[userId]
    )
        return null;
    return (
        multiplayerStore.playerRoundResults[userId][currentRoundNum - 1] || null
    );
});

const detailedPlayerResultsForCurrentRound = computed(() => {
    if (!showRoundResults.value) return [];
    const currentRoundNum = gameStore.currentRoundNumber;
    return multiplayerStore.players
        .map((player) => {
            const result =
                multiplayerStore.playerRoundResults[player.userId]?.[
                    currentRoundNum - 1
                ];
            return {
                userId: player.userId,
                username: player.username,
                roundScore: result?.score ?? 0,
                distanceKm: result?.distanceKm ?? -1,
                damageTaken: result?.damageTaken ?? 0,
                currentHealth: player.currentHealth,
                status: player.status,
            };
        })
        .sort((a, b) => b.roundScore - a.roundScore);
});

const roundWinnerUsername = computed(() => {
    if (!showRoundResults.value || !multiplayerStore.currentRoundWinnerId)
        return "N/A";
    const winner = multiplayerStore.players.find(
        (p) => p.userId === multiplayerStore.currentRoundWinnerId,
    );
    return winner?.username || "Unknown";
});

const roundWinnerScore = computed(() => {
    if (!showRoundResults.value || !multiplayerStore.currentRoundWinnerId)
        return 0;
    const winnerResult = detailedPlayerResultsForCurrentRound.value.find(
        (p) => p.userId === multiplayerStore.currentRoundWinnerId,
    );
    return winnerResult?.roundScore || 0;
});

// --- Methods ---
function handleMapGuess(coordinates) {
    if (
        !gameStore.isRoundActive ||
        multiplayerStore.isWaitingForRoundEnd ||
        showRoundResults.value
    )
        return;
    gameStore.recordGuess(coordinates);
}

function submitGuessHandler() {
    if (
        !gameStore.currentGuess ||
        !gameStore.isRoundActive ||
        multiplayerStore.isWaitingForRoundEnd ||
        showRoundResults.value
    )
        return;
    multiplayerStore.submitGuess();
}

function handleHostProceed() {
    if (!multiplayerStore.isHost || isAdvancing.value) {
        console.warn("Cannot proceed: Non-host or already advancing.");
        return;
    }
    isAdvancing.value = true;
    console.log(
        "Host action: handleHostProceed. Is last round:",
        isLastRound.value,
    );
    multiplayerStore.hostProceedToNextRound();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function startRoundTimer(duration) {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
    roundTimeRemaining.value = duration;
    if (duration > 0 && isRoundTimerActive.value) {
        roundTimerInterval = setInterval(() => {
            if (!isRoundTimerActive.value) {
                clearInterval(roundTimerInterval);
                return;
            }
            roundTimeRemaining.value--;
            if (roundTimeRemaining.value <= 0) {
                clearInterval(roundTimerInterval);
                roundTimerInterval = null;
            }
        }, 1000);
    }
}

function hasPlayerSubmittedGuessThisRound(userId) {
    const currentRoundNum = gameStore.currentRoundNumber;
    if (currentRoundNum <= 0) return false;
    const playerResultsForRound = multiplayerStore.playerRoundResults[userId];
    return playerResultsForRound?.[currentRoundNum - 1]?.guess !== undefined;
}

function getPlayerStatusClass(player) {
    if (player.status === "eliminated")
        return "bg-red-500/10 border-red-500/20 text-red-400/70 line-through";
    if (player.status === "disconnected" || player.status === "disconnected_ws")
        return "bg-white/[0.03] border-white/[0.06] text-white/25";

    if (multiplayerStore.isWaitingForRoundEnd || showRoundResults.value) {
        return hasPlayerSubmittedGuessThisRound(player.userId)
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            : "bg-white/[0.05] border-white/[0.08] text-white/50";
    }
    return gameStore.isRoundActive
        ? "bg-[#D36040]/[0.08] border-[#D36040]/20 text-[#D36040]/80"
        : "bg-white/[0.04] border-white/[0.07] text-white/40";
}

function toggleSettings() {
    showSettings.value = !showSettings.value;
}

// --- Lifecycle and Watchers ---
onMounted(() => {
    if (
        !multiplayerStore.gameId ||
        (!gameStore.gameId && gameStore.locations.length === 0)
    ) {
        router.push("/multiplayer/lobby");
        return;
    }
    isMapFullscreen.value = showRoundResults.value;

    if (
        gameStore.isRoundActive &&
        multiplayerStore.firstPlayerGuessedInRound &&
        !multiplayerStore.isWaitingForRoundEnd &&
        !showRoundResults.value &&
        multiplayerStore.roundDurationSeconds > 0
    ) {
        isRoundTimerActive.value = true;
        startRoundTimer(multiplayerStore.roundDurationSeconds);
    } else if (
        gameStore.isRoundActive &&
        !multiplayerStore.firstPlayerGuessedInRound
    ) {
        isRoundTimerActive.value = true;
        roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
    }
});

onUnmounted(() => {
    if (roundTimerInterval) clearInterval(roundTimerInterval);
});

watch(
    () => gameStore.currentRoundNumber,
    (newRound, oldRound) => {
        if (newRound > 0 && newRound !== oldRound) {
            if (roundTimerInterval) clearInterval(roundTimerInterval);
            isRoundTimerActive.value = false;
            roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
            isMapFullscreen.value = false;
            multiplayerStore.firstPlayerGuessedInRound = false;
            isAdvancing.value = false;
            mapDisplayRef.value?.resetMapState();
        }
    },
);

watch(
    () => gameStore.isGameOver,
    (isOver) => {
        if (isOver) isAdvancing.value = false;
    },
);

watch(showRoundResults, (isShowing) => {
    isMapFullscreen.value = isShowing;
    if (isShowing) {
        if (roundTimerInterval) clearInterval(roundTimerInterval);
        isRoundTimerActive.value = false;
    }
});

watch(
    () => multiplayerStore.isWaitingForRoundEnd,
    (isWaiting) => {
        if (isWaiting) {
            if (roundTimerInterval) clearInterval(roundTimerInterval);
            isRoundTimerActive.value = false;
        }
    },
);

watch(
    () => multiplayerStore.firstPlayerGuessedInRound,
    (firstGuessed) => {
        if (
            firstGuessed &&
            gameStore.isRoundActive &&
            !multiplayerStore.isWaitingForRoundEnd &&
            !showRoundResults.value &&
            multiplayerStore.roundDurationSeconds > 0
        ) {
            isRoundTimerActive.value = true;
            startRoundTimer(multiplayerStore.roundDurationSeconds);
        } else if (!firstGuessed) {
            if (roundTimerInterval) clearInterval(roundTimerInterval);
            isRoundTimerActive.value = gameStore.isRoundActive;
            roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
        }
    },
);

watch(
    () => gameStore.isRoundActive,
    (isActive) => {
        if (!isActive) {
            if (roundTimerInterval) clearInterval(roundTimerInterval);
            isRoundTimerActive.value = false;
        } else {
            isRoundTimerActive.value = true;
            roundTimeRemaining.value = multiplayerStore.roundDurationSeconds;
        }
    },
);
</script>

<style scoped>
.map-container :deep(.leaflet-container) {
    width: 100%;
    height: 100%;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -12px);
}
</style>
