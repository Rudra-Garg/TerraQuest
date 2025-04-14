// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import LoginView from '../views/LoginView.vue';     // <<< Import LoginView
import RegisterView from '../views/RegisterView.vue';
import { useAuthStore } from '../stores/AuthStore';


const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/game', name: 'Game', component: GameView, meta: { requiresAuth: true } }, // <<< Mark as requiresAuth
  { path: '/login', name: 'Login', component: LoginView, meta: { guestOnly: true } },     // <<< Add Login route
  { path: '/register', name: 'Register', component: RegisterView, meta: { guestOnly: true } }, // <<< Add Register route
  // Add routes for Profile, Leaderboard later (likely require auth)
  // { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  // { path: '/leaderboard', name: 'Leaderboard', component: LeaderboardView },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// --- Navigation Guards ---
// Setup guards *after* router is created and *before* it's exported
// IMPORTANT: Accessing store here can be tricky if app hasn't fully mounted.
// A common pattern is to initialize the store check inside beforeEach.
router.beforeEach((to, from, next) => {
  // Ensure store is accessible - this assumes main.js runs before routing kicks in fully
  // It's generally better to initialize auth state (check localStorage) in App.vue or main.js
  // and then trust the store's `isAuthenticated` getter here.
  const authStore = useAuthStore(); // Get store instance inside guard
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);
  const isAuthenticated = authStore.isAuthenticated; // Read current state

  // console.log(`Routing to: ${to.path}, RequiresAuth: ${requiresAuth}, GuestOnly: ${guestOnly}, IsAuthenticated: ${isAuthenticated}`); // Debug log

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    console.log('Redirecting to /login (auth required)');
    next({ name: 'Login' });
  } else if (guestOnly && isAuthenticated) {
    // Redirect away from login/register if already logged in
    console.log('Redirecting to / (already authenticated)');
    next({ name: 'Home' }); // Or '/game'
  } else {
    // Allow navigation
    next();
  }
});

export default router;