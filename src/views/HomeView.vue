<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative py-20 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="none" stroke="currentColor" stroke-width="0.5" />
              <circle cx="25" cy="25" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="flex flex-col lg:flex-row items-center">
          <div class="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 class="text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Explore the World <br>
              <span class="text-yellow-400">Test Your Geography Skills</span>
            </h1>
            <p class="text-lg text-blue-100 mb-8 max-w-lg">
              Drop into random locations around the globe and guess where you are! Challenge your geography knowledge
              and compete with others in this addictive geo-guessing game.
            </p>
            <div class="flex flex-wrap gap-4">
              <router-link to="/game"
                class="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg transform hover:scale-105">
                Play Now
              </router-link>
              <a href="#how-to-play"
                class="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium text-lg">
                How to Play
              </a>
            </div>
          </div>

          <div class="w-full lg:w-1/2 flex justify-center">
            <div class="relative w-full max-w-lg">
              <!-- Globe Illustration -->
              <div class="w-full h-64 md:h-80 lg:h-96 relative">
                <div class="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 w-full h-full">
                  <path fill="#FFFFFF"
                    d="M46,-78.3C60.2,-71.6,72.7,-61,81.1,-47.4C89.4,-33.9,93.6,-16.9,93.1,-0.3C92.6,16.4,87.5,32.8,78.1,45.7C68.7,58.6,55,68,40.3,73.4C25.5,78.9,9.7,80.4,-6.3,79.3C-22.3,78.3,-38.4,74.6,-51.6,66.1C-64.8,57.6,-75,44.2,-80.1,29.3C-85.2,14.4,-85.2,-2,-79.6,-15.6C-74,-29.1,-63,-39.7,-50.8,-47.7C-38.6,-55.7,-25.2,-61,-10.7,-67.7C3.8,-74.4,17.7,-82.5,31.8,-85.1C45.9,-87.7,60.3,-84.8,75.3,-76.2"
                    transform="translate(100 100)" class="text-white fill-current" />
                </svg>
                <svg class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5"
                  viewBox="0 0 100 100" fill="none">
                  <g stroke-width="0.8" stroke-linecap="round" stroke="currentColor" class="text-blue-200">
                    <!-- Latitude lines -->
                    <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(0)" />
                    <ellipse cx="50" cy="50" rx="45" ry="25" transform="rotate(0)" />
                    <ellipse cx="50" cy="50" rx="45" ry="35" transform="rotate(0)" />
                    <!-- Longitude lines -->
                    <path d="M50,5 C50,35 50,65 50,95" />
                    <path d="M5,50 C15,50 85,50 95,50" />
                    <path d="M13,26 C26,36 74,64 87,74" />
                    <path d="M13,74 C26,64 74,36 87,26" />
                  </g>
                  <!-- Location marker -->
                  <circle cx="65" cy="40" r="3" fill="#EF4444" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How to Play Section -->
    <section id="how-to-play" class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">How to Play TerraQuest</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div
            class="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div
              class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              1</div>
            <h3 class="text-xl font-semibold mb-3">Explore Street View</h3>
            <p class="text-gray-600">You'll be dropped into a random location using Google Street View. Look around for
              clues about your location.</p>
          </div>

          <!-- Step 2 -->
          <div
            class="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div
              class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              2</div>
            <h3 class="text-xl font-semibold mb-3">Make Your Guess</h3>
            <p class="text-gray-600">When you're ready, click on the world map to place your guess for where you think
              you are.</p>
          </div>

          <!-- Step 3 -->
          <div
            class="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div
              class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              3</div>
            <h3 class="text-xl font-semibold mb-3">Score Points</h3>
            <p class="text-gray-600">Score is based on how close your guess is to the actual location. The closer you
              are, the more points you earn!</p>
          </div>
        </div>

        <div class="text-center mt-16">
          <router-link to="/game"
            class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg inline-block">
            Start Playing Now
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-16">Game Features</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Feature 1 -->
          <div class="text-center">
            <div class="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Global Locations</h3>
            <p class="text-gray-600">Challenge yourself with locations from all around the world</p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center">
            <div class="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Multiplayer</h3>
            <p class="text-gray-600">Compete with friends and players worldwide</p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center">
            <div class="inline-block p-4 bg-green-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Leaderboards</h3>
            <p class="text-gray-600">Track your progress and compare with others</p>
          </div>

          <!-- Feature 4 -->
          <div class="text-center">
            <div class="inline-block p-4 bg-purple-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Achievement System</h3>
            <p class="text-gray-600">Earn badges and unlock new challenges</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Ready to Test Your Geography Knowledge?</h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of players from around the world in the
          ultimate geography challenge!</p>

        <div class="flex flex-wrap justify-center gap-4">
          <router-link to="/register"
            class="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg">
            Sign Up Free
          </router-link>
          <router-link to="/game"
            class="px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 text-white rounded-lg transition-all duration-300 font-medium text-lg">
            Play as Guest
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// No additional script needed for this static page
</script>