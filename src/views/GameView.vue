<template>
    <div class="relative w-full h-screen overflow-hidden bg-[#09090B]">
        <!-- ═══════════════════════════════════════════════
         1. STREET VIEW (fullscreen background)
    ═══════════════════════════════════════════════ -->
        <div class="absolute inset-0 z-0">
            <StreetViewDisplay
                :location="GameStore.getCurrentLocation"
                v-if="
                    GameStore.gameId &&
                    !GameStore.isGameOver &&
                    GameStore.getCurrentLocation
                "
                class="w-full h-full"
            />
            <!-- Loading location -->
            <div
                v-else-if="GameStore.gameId && !GameStore.isGameOver"
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
                        Loading location…
                    </p>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
         2. HUD — TOP BAR (visible during active game)
    ═══════════════════════════════════════════════ -->
        <div
            v-if="GameStore.gameId && !GameStore.isGameOver && !isMapFullscreen"
            class="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        >
            <div
                class="flex items-start justify-between p-5 bg-gradient-to-b from-black/60 to-transparent"
            >
                <!-- Score chip -->
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
                        {{ GameStore.totalScore }}
                    </p>
                </div>

                <!-- Round indicator (dots) -->
                <div class="flex items-center gap-2 mt-2">
                    <div
                        v-for="round in GameStore.MAX_ROUNDS"
                        :key="round"
                        class="transition-all duration-300 rounded-full"
                        :class="[
                            round < GameStore.currentRoundNumber
                                ? 'w-2 h-2 bg-white/60'
                                : round === GameStore.currentRoundNumber
                                  ? 'w-3 h-3 bg-[#D36040] shadow-lg shadow-[#D36040]/50'
                                  : 'w-2 h-2 bg-white/15',
                        ]"
                    />
                </div>

                <!-- Settings button -->
                <div class="relative pointer-events-auto">
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

                    <!-- Settings dropdown -->
                    <div
                        v-if="showSettings"
                        class="absolute top-12 right-0 bg-[#111117]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-2xl p-4 min-w-[200px] z-50"
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
                                Dark Map
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
         3. MAP (bottom-right minimap / fullscreen after guess)
    ═══════════════════════════════════════════════ -->
        <div
            v-if="GameStore.gameId && !GameStore.isGameOver"
            class="map-container group absolute transition-all duration-500 ease-in-out overflow-hidden"
            :class="{
                'inset-0 z-30 rounded-none border-0':
                    isMapFullscreen ||
                    GameStore.hasSubmittedGuessForCurrentRound,
                'bottom-24 right-5 w-52 h-40 md:w-64 md:h-48 z-20 rounded-xl border border-white/20 shadow-2xl shadow-black/50 hover:w-[38vw] hover:h-[35vh] hover:shadow-black/70':
                    !isMapFullscreen &&
                    !GameStore.hasSubmittedGuessForCurrentRound,
            }"
        >
            <MapDisplay
                @guess-made="handleMapGuess"
                ref="mapDisplayRef"
                :round-active="GameStore.isRoundActive"
                :submitted="GameStore.hasSubmittedGuessForCurrentRound"
                :actual-location="
                    GameStore.hasSubmittedGuessForCurrentRound
                        ? GameStore.getCurrentLocation
                        : null
                "
                :guess-location="
                    GameStore.hasSubmittedGuessForCurrentRound
                        ? GameStore.getCurrentRoundResult?.guess
                        : null
                "
                class="w-full h-full cursor-crosshair"
            />

            <!-- Expand hint (shown only on minimap before guess) -->
            <div
                v-if="
                    !isMapFullscreen &&
                    !GameStore.hasSubmittedGuessForCurrentRound
                "
                class="absolute bottom-2 left-2 text-[9px] text-white/40 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none group-hover:opacity-0 transition-opacity"
            >
                Hover to expand
            </div>

            <!-- ── Result overlay (shown after submitting guess) ── -->
            <div
                v-if="
                    GameStore.hasSubmittedGuessForCurrentRound &&
                    GameStore.getCurrentRoundResult
                "
                class="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/[0.1] rounded-xl p-5 max-w-[280px] shadow-2xl"
            >
                <p
                    class="text-[10px] text-[#D36040] uppercase tracking-widest font-medium mb-3"
                >
                    Round {{ GameStore.currentRoundNumber }} Result
                </p>

                <div class="space-y-3">
                    <div>
                        <p
                            class="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"
                        >
                            Distance
                        </p>
                        <p
                            class="text-2xl font-light text-[#D36040] tabular-nums"
                        >
                            {{
                                GameStore.getCurrentRoundResult.distanceKm.toFixed(
                                    1,
                                )
                            }}
                            <span class="text-xs text-[#D36040]/60 font-normal"
                                >km</span
                            >
                        </p>
                    </div>
                    <div>
                        <p
                            class="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"
                        >
                            Points
                        </p>
                        <p class="text-2xl font-light text-white tabular-nums">
                            {{ GameStore.getCurrentRoundResult.score }}
                            <span class="text-xs text-white/30 font-normal"
                                >pts</span
                            >
                        </p>
                    </div>
                    <div class="pt-2 border-t border-white/[0.07]">
                        <p
                            class="text-[10px] text-white/30 uppercase tracking-wider mb-0.5"
                        >
                            Total
                        </p>
                        <p class="text-lg font-light text-white tabular-nums">
                            {{ GameStore.totalScore }}
                            <span class="text-xs text-white/30 font-normal"
                                >pts</span
                            >
                        </p>
                    </div>
                </div>
            </div>

            <!-- Navigation buttons (fullscreen result view) -->
            <div
                v-if="GameStore.hasSubmittedGuessForCurrentRound"
                class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10"
            >
                <button
                    v-if="GameStore.currentRoundNumber < GameStore.MAX_ROUNDS"
                    @click="nextRoundHandler"
                    class="flex items-center gap-2.5 px-7 py-3 bg-white hover:bg-white/90 text-black font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl text-sm"
                >
                    Next Round
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
                </button>
                <button
                    v-else
                    @click="viewResultsHandler"
                    class="flex items-center gap-2.5 px-7 py-3 bg-[#D36040] hover:bg-[#b04a2e] text-white font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#D36040]/30 text-sm"
                >
                    View Results
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
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
         4. BOTTOM CONTROLS (submit button)
    ═══════════════════════════════════════════════ -->
        <div
            v-if="
                GameStore.gameId &&
                !GameStore.isGameOver &&
                !GameStore.hasSubmittedGuessForCurrentRound
            "
            class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
            <!-- Coordinates display -->
            <p
                v-if="GameStore.currentGuess"
                class="text-[11px] font-mono text-white/50 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/[0.08]"
            >
                {{ GameStore.currentGuess.lat.toFixed(4) }}°,
                {{ GameStore.currentGuess.lng.toFixed(4) }}°
            </p>

            <button
                @click="submitGuessHandler"
                :disabled="
                    !GameStore.currentGuess ||
                    !GameStore.isRoundActive ||
                    GameStore.hasSubmittedGuessForCurrentRound
                "
                class="flex items-center gap-3 px-10 py-3.5 font-medium rounded-full transition-all text-sm shadow-2xl"
                :class="
                    GameStore.currentGuess && GameStore.isRoundActive
                        ? 'bg-[#D36040] hover:bg-[#b04a2e] text-white shadow-[#D36040]/30 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-black/50 backdrop-blur-md border border-white/[0.1] text-white/30 cursor-not-allowed'
                "
            >
                <svg
                    v-if="GameStore.currentGuess && GameStore.isRoundActive"
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
                    GameStore.currentGuess
                        ? "Submit Guess"
                        : "Click the map to place a pin"
                }}
            </button>
        </div>

        <!-- ═══════════════════════════════════════════════
         5. ERROR MESSAGE
    ═══════════════════════════════════════════════ -->
        <div
            v-if="GameStore.gameError"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4"
        >
            <div
                class="bg-[#111117] border border-red-500/20 rounded-2xl p-6 shadow-2xl text-center"
            >
                <div
                    class="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4"
                >
                    <svg
                        class="w-6 h-6 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <p class="text-sm font-medium text-white mb-1.5">
                    Something went wrong
                </p>
                <p class="text-sm text-white/40 mb-5">
                    {{ GameStore.gameError }}
                </p>
                <button
                    @click="GameStore.clearGameError()"
                    class="px-5 py-2.5 bg-[#D36040] hover:bg-[#b04a2e] text-white text-sm font-medium rounded-lg transition-all"
                >
                    Dismiss
                </button>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
         6. GLOBAL LOADING OVERLAY
    ═══════════════════════════════════════════════ -->
        <div
            v-if="GameStore.isLoading && !GameStore.isGameOver"
            class="absolute inset-0 bg-[#09090B]/90 backdrop-blur-md flex flex-col items-center justify-center z-50"
        >
            <svg
                class="animate-spin h-10 w-10 text-[#D36040] mb-5"
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
            <p class="text-sm text-white/50 tracking-wider">Loading…</p>
        </div>

        <!-- ═══════════════════════════════════════════════
         7. START SCREEN
    ═══════════════════════════════════════════════ -->
        <div
            v-if="!GameStore.gameId && !GameStore.isGameOver"
            class="absolute inset-0 z-40 flex items-center justify-center"
        >
            <!-- Background photo -->
            <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2400&auto=format&fit=crop"
                alt=""
                class="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div
                class="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-[#09090B]/50"
            ></div>

            <!-- Subtle grid -->
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
                    background-size: 64px 64px;
                "
            ></div>

            <!-- Card -->
            <div
                class="relative z-10 text-center max-w-lg mx-6 px-8 py-12 bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl"
            >
                <!-- Logo -->
                <div class="flex items-center justify-center gap-2.5 mb-8">
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
                    <span class="text-lg font-semibold text-white tracking-wide"
                        >TerraQuest</span
                    >
                </div>

                <h2
                    class="text-4xl md:text-5xl font-light text-white mb-3 tracking-tight"
                >
                    Where are<br />
                    <span
                        class="italic font-normal"
                        style="
                            font-family:
                                &quot;Playfair Display&quot;, Georgia, serif;
                        "
                        >you?</span
                    >
                </h2>

                <p
                    class="text-sm text-white/40 max-w-xs mx-auto leading-relaxed mb-10"
                >
                    You'll be dropped at 5 random locations around the globe.
                    Use your surroundings to pinpoint where you are.
                </p>

                <!-- Round preview -->
                <div class="flex items-center justify-center gap-1.5 mb-10">
                    <div
                        v-for="i in 5"
                        :key="i"
                        class="w-2 h-2 rounded-full bg-white/15"
                    ></div>
                </div>

                <button
                    @click="startGameHandler"
                    :disabled="!GameStore.isMapsApiReady || GameStore.isLoading"
                    class="inline-flex items-center gap-3 px-10 py-4 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.08] disabled:text-white/25 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#D36040]/20 text-sm"
                >
                    <svg
                        v-if="!GameStore.isMapsApiReady || GameStore.isLoading"
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
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <svg
                        v-else
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        />
                    </svg>
                    {{
                        !GameStore.isMapsApiReady
                            ? "Loading Maps…"
                            : GameStore.isLoading
                              ? "Starting…"
                              : "Start Playing"
                    }}
                </button>

                <p
                    v-if="gameError && !GameStore.gameId"
                    class="mt-5 text-sm text-red-400"
                >
                    {{ gameError }}
                </p>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
         8. GAME OVER SCREEN
    ═══════════════════════════════════════════════ -->
        <div
            v-if="GameStore.isGameOver && GameStore.gameId"
            class="absolute inset-0 z-40 flex items-center justify-center"
        >
            <!-- Background photo -->
            <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2400&auto=format&fit=crop"
                alt=""
                class="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div
                class="absolute inset-0 bg-[#09090B]/80 backdrop-blur-sm"
            ></div>

            <!-- Results card -->
            <div
                class="relative z-10 w-full max-w-lg mx-6 bg-black/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
                <!-- Accent line -->
                <div
                    class="h-1 w-full bg-gradient-to-r from-[#D36040] via-[#D36040]/60 to-transparent"
                ></div>

                <div class="p-8 md:p-10 text-center">
                    <!-- Header -->
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-[#D36040]"
                        ></span>
                        <span
                            class="text-xs text-[#D36040] font-medium tracking-[0.2em] uppercase"
                            >Game Complete</span
                        >
                    </div>
                    <h2
                        class="text-3xl md:text-4xl font-light text-white mb-8 tracking-tight"
                    >
                        Your Final Score
                    </h2>

                    <!-- Big score -->
                    <div class="mb-8">
                        <p
                            class="text-7xl md:text-8xl font-light text-white tabular-nums leading-none"
                        >
                            {{ GameStore.totalScore.toLocaleString() }}
                        </p>
                        <p class="text-sm text-white/30 mt-2 tracking-wider">
                            points
                        </p>
                    </div>

                    <!-- Round-by-round breakdown -->
                    <div
                        class="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mb-8"
                    >
                        <p
                            class="text-[10px] text-white/25 uppercase tracking-widest mb-3"
                        >
                            Round Breakdown
                        </p>
                        <div class="flex justify-between items-end gap-3">
                            <div
                                v-for="round in GameStore.MAX_ROUNDS"
                                :key="round"
                                class="flex-1 flex flex-col items-center gap-1.5"
                            >
                                <!-- Mini bar -->
                                <div
                                    class="w-full bg-white/[0.05] rounded-sm overflow-hidden"
                                    style="height: 32px"
                                >
                                    <div
                                        class="w-full bg-[#D36040]/70 rounded-sm transition-all duration-700"
                                        :style="{
                                            height: GameStore.roundResults[
                                                round - 1
                                            ]
                                                ? Math.max(
                                                      4,
                                                      (GameStore.roundResults[
                                                          round - 1
                                                      ].score /
                                                          5000) *
                                                          32,
                                                  ) + 'px'
                                                : '4px',
                                            marginTop: 'auto',
                                        }"
                                    ></div>
                                </div>
                                <span class="text-[10px] text-white/30"
                                    >R{{ round }}</span
                                >
                                <span
                                    class="text-xs font-mono text-white/60 tabular-nums"
                                >
                                    {{
                                        GameStore.roundResults[round - 1]
                                            ?.score ?? "—"
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 justify-center">
                        <button
                            @click="startGameHandler"
                            class="flex items-center gap-2.5 px-7 py-3 bg-[#D36040] hover:bg-[#b04a2e] text-white font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D36040]/20 text-sm"
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
                            @click="shareResults"
                            class="flex items-center gap-2.5 px-7 py-3 bg-white/[0.07] hover:bg-white/[0.11] border border-white/[0.1] text-white font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                            Share Results
                        </button>
                        <button
                            @click="returnHome"
                            class="flex items-center gap-2.5 px-7 py-3 bg-white/[0.07] hover:bg-white/[0.11] border border-white/[0.1] text-white font-medium rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/GameStore";
import StreetViewDisplay from "../components/StreetViewDisplay.vue";
import MapDisplay from "../components/MapDisplay.vue";

const router = useRouter();
const GameStore = useGameStore();
const mapDisplayRef = ref(null);
const isMapFullscreen = ref(false);
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

function toggleSettings() {
    showSettings.value = !showSettings.value;
}

function handleMapGuess(coordinates) {
    if (!GameStore.isRoundActive || GameStore.hasSubmittedGuessForCurrentRound)
        return;
    GameStore.recordGuess(coordinates);
}

function submitGuessHandler() {
    if (
        !GameStore.currentGuess ||
        !GameStore.isRoundActive ||
        GameStore.hasSubmittedGuessForCurrentRound
    )
        return;
    GameStore.submitGuess();
}

async function nextRoundHandler() {
    isMapFullscreen.value = false;
    if (mapDisplayRef.value) {
        mapDisplayRef.value.resetMapState();
    }
    await GameStore.nextRound();
}

function viewResultsHandler() {
    GameStore.isGameOver = true;
    GameStore.isRoundActive = false;
}

function returnHome() {
    GameStore.resetState();
    router.push("/");
}

async function startGameHandler() {
    isMapFullscreen.value = false;
    await GameStore.startGame();
}

async function shareResults() {
    const text = `I scored ${GameStore.totalScore.toLocaleString()} pts on TerraQuest! Can you beat me?`;
    if (navigator.share) {
        try {
            await navigator.share({ title: "TerraQuest Results", text });
        } catch {
            // user cancelled or API unavailable — fall back silently
        }
    } else {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // clipboard not available
        }
    }
}
</script>

<style scoped>
.map-container :deep(.leaflet-container) {
    width: 100%;
    height: 100%;
}
</style>
