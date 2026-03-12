<template>
    <div class="relative min-h-screen overflow-hidden bg-[#09090B]">
        <!-- Background Photo -->
        <div class="absolute inset-0">
            <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2600&auto=format&fit=crop"
                alt=""
                class="w-full h-full object-cover opacity-40"
            />
            <!-- Gradient overlays -->
            <div
                class="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/75 to-transparent"
            ></div>
            <div
                class="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]/50"
            ></div>
        </div>

        <!-- Subtle grid -->
        <div
            class="absolute inset-0 opacity-[0.025] pointer-events-none"
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
                background-size: 72px 72px;
            "
        ></div>

        <!-- Animated scan line -->
        <div
            class="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D36040]/30 to-transparent animate-[scanline_4s_ease-in-out_infinite] pointer-events-none"
            style="top: 30%"
        ></div>

        <!-- Main Content -->
        <div
            class="relative z-10 flex flex-col justify-center min-h-screen px-8 md:px-16 lg:px-28 pt-20 pb-16"
        >
            <div class="max-w-2xl">
                <!-- Eyebrow -->
                <div class="flex items-center gap-3 mb-8">
                    <span
                        class="inline-block w-1.5 h-1.5 rounded-full bg-[#D36040] animate-pulse"
                    ></span>
                    <span
                        class="text-xs font-medium text-[#D36040] tracking-[0.25em] uppercase"
                        >Geography Challenge</span
                    >
                    <span class="h-px w-12 bg-[#D36040]/30"></span>
                </div>

                <!-- Headline -->
                <h1
                    class="font-light text-white leading-[1.08] tracking-tight mb-6"
                >
                    <span class="block text-5xl md:text-6xl lg:text-[5.5rem]"
                        >Where in the</span
                    >
                    <span class="block text-5xl md:text-6xl lg:text-[5.5rem]">
                        world
                        <span
                            class="text-white/90 italic font-normal"
                            style="
                                font-family:
                                    &quot;Playfair Display&quot;, Georgia, serif;
                            "
                        >
                            are you?</span
                        >
                    </span>
                </h1>

                <!-- Subtext -->
                <p
                    class="text-base md:text-lg text-white/45 max-w-[440px] leading-relaxed mb-10"
                >
                    You're dropped somewhere on Earth with no clues. Use your
                    surroundings to pinpoint your location on the map.
                </p>

                <!-- CTAs -->
                <div class="flex flex-wrap gap-4 mb-14">
                    <router-link
                        to="/game"
                        class="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#D36040] hover:bg-[#b04a2e] text-white font-medium rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D36040]/20"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            />
                        </svg>
                        Play Solo
                    </router-link>
                    <router-link
                        to="/multiplayer/create"
                        class="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.12] text-white font-medium rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                    >
                        <svg
                            class="w-4 h-4 text-white/70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.8"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        Play with Friends
                    </router-link>
                    <router-link
                        to="/multiplayer/join"
                        class="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.12] text-white font-medium rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                    >
                        <svg
                            class="w-4 h-4 text-white/70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.8"
                                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                            />
                        </svg>
                        Join Game
                    </router-link>
                </div>

                <!-- Stats strip -->
                <div
                    class="flex items-center gap-8 pt-8 border-t border-white/[0.07]"
                >
                    <div>
                        <p class="text-2xl font-light text-white tabular-nums">
                            195
                        </p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider mt-0.5 uppercase"
                        >
                            Countries
                        </p>
                    </div>
                    <div class="w-px h-8 bg-white/[0.08]"></div>
                    <div>
                        <p class="text-2xl font-light text-white">5</p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider mt-0.5 uppercase"
                        >
                            Rounds
                        </p>
                    </div>
                    <div class="w-px h-8 bg-white/[0.08]"></div>
                    <div>
                        <p class="text-2xl font-light text-white">∞</p>
                        <p
                            class="text-[11px] text-white/30 tracking-wider mt-0.5 uppercase"
                        >
                            Locations
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Coordinate decoration (bottom-right) -->
        <div
            class="absolute bottom-10 right-10 hidden lg:flex flex-col items-end gap-1.5 pointer-events-none select-none"
        >
            <!-- Compass SVG -->
            <svg
                class="w-20 h-20 opacity-[0.07] mb-2"
                viewBox="0 0 100 100"
                fill="none"
                stroke="white"
                stroke-width="1"
            >
                <circle cx="50" cy="50" r="46" />
                <circle cx="50" cy="50" r="38" />
                <line x1="50" y1="4" x2="50" y2="20" />
                <line x1="50" y1="80" x2="50" y2="96" />
                <line x1="4" y1="50" x2="20" y2="50" />
                <line x1="80" y1="50" x2="96" y2="50" />
                <polygon
                    points="50,16 46,50 50,44 54,50"
                    fill="white"
                    stroke="none"
                    opacity="0.6"
                />
                <polygon
                    points="50,84 46,50 50,56 54,50"
                    fill="white"
                    stroke="none"
                    opacity="0.3"
                />
                <text
                    x="50"
                    y="10"
                    text-anchor="middle"
                    font-size="8"
                    fill="white"
                    opacity="0.5"
                    stroke="none"
                >
                    N
                </text>
                <text
                    x="50"
                    y="96"
                    text-anchor="middle"
                    font-size="8"
                    fill="white"
                    opacity="0.3"
                    stroke="none"
                    dy="-2"
                >
                    S
                </text>
                <text
                    x="8"
                    y="54"
                    text-anchor="middle"
                    font-size="8"
                    fill="white"
                    opacity="0.3"
                    stroke="none"
                >
                    W
                </text>
                <text
                    x="92"
                    y="54"
                    text-anchor="middle"
                    font-size="8"
                    fill="white"
                    opacity="0.3"
                    stroke="none"
                >
                    E
                </text>
            </svg>
            <p class="font-mono text-[11px] text-white/15 tracking-[0.15em]">
                ??.???? ° N
            </p>
            <p class="font-mono text-[11px] text-white/15 tracking-[0.15em]">
                ??.???? ° E
            </p>
            <p
                class="font-mono text-[10px] text-white/10 tracking-[0.2em] uppercase mt-1"
            >
                Location Unknown
            </p>
        </div>

        <!-- Scroll cue -->
        <div
            class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-20 pointer-events-none"
        >
            <div
                class="w-px h-8 bg-white/60 animate-[pulse_2s_ease-in-out_infinite]"
            ></div>
        </div>
    </div>
</template>

<script setup></script>

<style scoped>
@keyframes scanline {
    0%,
    100% {
        opacity: 0;
        top: 20%;
    }
    50% {
        opacity: 1;
        top: 75%;
    }
}
</style>
