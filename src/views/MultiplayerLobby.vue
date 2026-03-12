<template>
    <div class="min-h-screen bg-[#09090B] pt-20 pb-12 px-4 md:px-6">
        <div class="max-w-5xl mx-auto">
            <!-- Header -->
            <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            >
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-[#D36040] animate-pulse"
                        ></span>
                        <span
                            class="text-xs text-[#D36040] font-medium tracking-[0.2em] uppercase"
                            >Multiplayer Lobby</span
                        >
                    </div>
                    <h1
                        class="text-2xl font-semibold text-white tracking-tight"
                    >
                        Waiting for players
                    </h1>
                </div>

                <!-- Room code badge -->
                <div
                    v-if="multiplayerStore.gameCode"
                    class="flex items-center gap-3 px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl"
                >
                    <div>
                        <p
                            class="text-[10px] text-white/30 uppercase tracking-widest mb-0.5"
                        >
                            Room Code
                        </p>
                        <p
                            class="font-mono text-xl font-semibold text-[#D36040] tracking-[0.3em]"
                        >
                            {{ multiplayerStore.gameCode }}
                        </p>
                    </div>
                    <button
                        @click="copyGameCode"
                        class="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/40 hover:text-white transition-all"
                        title="Copy room code"
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Connection status banner -->
            <div
                class="mb-6 px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all"
                :class="connectionStatusClass"
            >
                <span
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :class="
                        multiplayerStore.isConnected
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400/60'
                            : 'bg-yellow-400 animate-pulse'
                    "
                ></span>
                <p class="font-medium">{{ connectionStatusText }}</p>
            </div>

            <!-- Error banner -->
            <div
                v-if="multiplayerStore.error && !multiplayerStore.isConnected"
                class="mb-6 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] text-sm flex items-center justify-between gap-4"
            >
                <div class="flex items-center gap-2.5">
                    <svg
                        class="w-4 h-4 text-red-400 flex-shrink-0"
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
                    <p class="text-red-400">{{ multiplayerStore.error }}</p>
                </div>
                <button
                    @click="multiplayerStore.connect()"
                    class="text-xs text-white/50 hover:text-white underline transition-colors flex-shrink-0"
                >
                    Retry
                </button>
            </div>

            <!-- Main grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <!-- Players list (2/3 width) -->
                <div
                    class="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
                >
                    <div
                        class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between"
                    >
                        <h2 class="text-sm font-medium text-white/60">
                            Players
                            <span
                                class="ml-2 px-2 py-0.5 bg-white/[0.06] rounded-full text-xs text-white/40"
                            >
                                {{ multiplayerStore.players.length }}
                            </span>
                        </h2>
                        <!-- Player dots indicator -->
                        <div class="flex gap-1.5">
                            <span
                                v-for="i in 6"
                                :key="i"
                                class="w-2 h-2 rounded-full transition-colors duration-300"
                                :class="
                                    i <= multiplayerStore.players.length
                                        ? 'bg-[#D36040]/70'
                                        : 'bg-white/[0.08]'
                                "
                            >
                            </span>
                        </div>
                    </div>

                    <div class="p-4 space-y-2 min-h-[320px]">
                        <!-- Player item -->
                        <div
                            v-for="player in multiplayerStore.players"
                            :key="player.userId"
                            class="flex items-center justify-between p-4 rounded-xl border transition-all"
                            :class="
                                player.userId === authStore.userProfile?.id
                                    ? 'bg-[#D36040]/[0.06] border-[#D36040]/20'
                                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                            "
                        >
                            <div class="flex items-center gap-3.5">
                                <!-- Avatar -->
                                <div
                                    class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 select-none"
                                    :class="
                                        player.userId ===
                                        authStore.userProfile?.id
                                            ? 'bg-[#D36040]/15 border border-[#D36040]/30 text-[#D36040]'
                                            : 'bg-white/[0.06] border border-white/[0.08] text-white/60'
                                    "
                                >
                                    {{
                                        player.username
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"
                                    }}
                                </div>

                                <!-- Name & badges -->
                                <div>
                                    <div
                                        class="flex items-center gap-2 flex-wrap"
                                    >
                                        <span
                                            class="text-sm font-medium text-white"
                                        >
                                            {{ player.username || "Joining…" }}
                                        </span>
                                        <span
                                            v-if="
                                                player.userId ===
                                                authStore.userProfile?.id
                                            "
                                            class="text-[10px] px-2 py-0.5 rounded-full bg-[#D36040]/10 border border-[#D36040]/25 text-[#D36040] font-medium"
                                        >
                                            You
                                        </span>
                                        <span
                                            v-if="player.isHost"
                                            class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium"
                                        >
                                            Host
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Ready status -->
                            <div class="flex items-center gap-2">
                                <div
                                    v-if="player.isReady"
                                    class="flex items-center gap-1.5 text-emerald-400"
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
                                            stroke-width="2.5"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span class="text-xs font-medium"
                                        >Ready</span
                                    >
                                </div>
                                <div
                                    v-else
                                    class="flex items-center gap-1.5 text-white/25"
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
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    <span class="text-xs">Waiting</span>
                                </div>
                            </div>
                        </div>

                        <!-- Empty state -->
                        <div
                            v-if="
                                multiplayerStore.players.length === 0 &&
                                multiplayerStore.isConnected
                            "
                            class="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <div
                                class="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4"
                            >
                                <svg
                                    class="w-7 h-7 text-white/15"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <p class="text-sm text-white/30">
                                Waiting for players to join…
                            </p>
                            <p class="text-xs text-white/20 mt-1">
                                Share the room code to invite friends
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Sidebar: Chat + Controls -->
                <div class="flex flex-col gap-4">
                    <!-- Chat -->
                    <div
                        class="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col"
                        style="min-height: 260px; max-height: 340px"
                    >
                        <div class="px-5 py-4 border-b border-white/[0.06]">
                            <h2
                                class="text-sm font-medium text-white/60 flex items-center gap-2"
                            >
                                <svg
                                    class="w-3.5 h-3.5 text-white/25"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                Chat
                            </h2>
                        </div>

                        <!-- Messages -->
                        <div
                            ref="chatBoxRef"
                            class="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin"
                        >
                            <div
                                v-for="(
                                    message, index
                                ) in multiplayerStore.chatMessages"
                                :key="index"
                            >
                                <span
                                    class="text-xs font-medium"
                                    :class="
                                        message.userId ===
                                        authStore.userProfile?.id
                                            ? 'text-[#D36040]'
                                            : 'text-white/40'
                                    "
                                >
                                    {{ message.username || "User" }}
                                </span>
                                <span
                                    class="ml-2 text-sm text-white/70 break-words"
                                    >{{ message.content }}</span
                                >
                            </div>
                            <div
                                v-if="
                                    multiplayerStore.chatMessages.length === 0
                                "
                                class="text-center py-8 text-white/20 text-xs"
                            >
                                No messages yet
                            </div>
                        </div>

                        <!-- Input -->
                        <div class="p-3 border-t border-white/[0.06]">
                            <div class="flex gap-2">
                                <input
                                    v-model="chatInput"
                                    type="text"
                                    placeholder="Say something…"
                                    class="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#D36040]/40 transition-all"
                                    @keyup.enter="handleSendChatMessage"
                                    :disabled="!multiplayerStore.isConnected"
                                />
                                <button
                                    @click="handleSendChatMessage"
                                    :disabled="
                                        !multiplayerStore.isConnected ||
                                        !chatInput.trim()
                                    "
                                    class="px-3 py-2 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.05] disabled:text-white/20 text-white rounded-lg transition-all flex-shrink-0"
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
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div
                        class="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-3"
                    >
                        <!-- Ready toggle -->
                        <button
                            v-if="!multiplayerStore.isCurrentPlayerReady"
                            @click="handleSetReady(true)"
                            :disabled="!multiplayerStore.isConnected"
                            class="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm"
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
                                    stroke-width="2.5"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Ready
                        </button>
                        <button
                            v-else
                            @click="handleSetReady(false)"
                            :disabled="!multiplayerStore.isConnected"
                            class="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.06] hover:bg-white/[0.09] disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] text-white/70 font-medium rounded-xl transition-all text-sm"
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
                            Unready
                        </button>

                        <!-- Start game (host only) -->
                        <button
                            v-if="multiplayerStore.isHost"
                            @click="handleStartGame"
                            :disabled="!canStartGame"
                            class="w-full flex items-center justify-center gap-2 py-3 bg-[#D36040] hover:bg-[#b04a2e] disabled:bg-white/[0.04] disabled:text-white/20 disabled:border disabled:border-white/[0.07] disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all text-sm"
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
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Start Game
                        </button>

                        <!-- Leave -->
                        <button
                            @click="handleLeaveGame"
                            class="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-white/30 hover:text-red-400 hover:bg-red-500/[0.07] border border-white/[0.05] hover:border-red-500/20 rounded-xl transition-all"
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
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Leave Game
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Copy toast -->
        <transition name="page">
            <div
                v-if="showCopyConfirm"
                class="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 bg-[#111117] border border-white/[0.1] rounded-xl shadow-2xl text-sm text-white z-50"
            >
                <svg
                    class="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                Room code copied!
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useMultiplayerStore } from "../stores/MultiplayerStore";
import { useAuthStore } from "../stores/AuthStore";

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const authStore = useAuthStore();
const chatInput = ref("");
const chatBoxRef = ref(null);
const showCopyConfirm = ref(false);

const connectionStatusText = computed(() => {
    if (multiplayerStore.isConnected)
        return "Connected — waiting for all players to ready up";
    if (multiplayerStore.error && !multiplayerStore.isConnected)
        return "Connection failed";
    return "Connecting to room…";
});

const connectionStatusClass = computed(() => {
    if (multiplayerStore.isConnected)
        return "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400";
    if (multiplayerStore.error && !multiplayerStore.isConnected)
        return "border-red-500/20 bg-red-500/[0.06] text-red-400";
    return "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-400 animate-pulse";
});

const canStartGame = computed(() => {
    if (!multiplayerStore.isConnected) return false;
    if (!multiplayerStore.isHost) return false;
    if (multiplayerStore.players.length < 1) return false;
    return multiplayerStore.isEveryoneReady;
});

function copyGameCode() {
    if (!multiplayerStore.gameCode) return;
    navigator.clipboard
        .writeText(multiplayerStore.gameCode)
        .then(() => {
            showCopyConfirm.value = true;
            setTimeout(() => {
                showCopyConfirm.value = false;
            }, 2000);
        })
        .catch((err) => console.error("Failed to copy game code: ", err));
}

function handleSetReady(isReady) {
    multiplayerStore.setReady(isReady);
}

function handleSendChatMessage() {
    multiplayerStore.sendChatMessage(chatInput.value);
    chatInput.value = "";
}

function handleStartGame() {
    if (canStartGame.value) {
        console.log("Host clicking Start Game button…");
        multiplayerStore.hostStartGame();
    } else {
        console.warn("Start game clicked but conditions not met.");
        multiplayerStore.error = "Cannot start game yet.";
        setTimeout(() => {
            multiplayerStore.error = null;
        }, 3000);
    }
}

function handleLeaveGame() {
    multiplayerStore.leaveGame();
    router.push("/");
}

watch(
    () => multiplayerStore.chatMessages,
    async () => {
        await nextTick();
        const chatBox = chatBoxRef.value;
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    },
    { deep: true },
);

onMounted(() => {
    if (!multiplayerStore.gameCode || !multiplayerStore.gameId) {
        console.warn("Landed in lobby without game context, redirecting home.");
        router.push("/");
        return;
    }
    if (!multiplayerStore.isConnected) {
        multiplayerStore.connect();
    }
    nextTick(() => {
        const chatBox = chatBoxRef.value;
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    });
});

onUnmounted(() => {});
</script>
