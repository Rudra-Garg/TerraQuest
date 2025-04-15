<template>
  <div class="profile-container">
    <h1>Profile</h1>
    <div v-if="userProfile" class="profile-content">
      <div class="profile-header">
        <h2>{{ userProfile.username }}</h2>
        <p>Member since {{ formatDate(userProfile.createdAt) }}</p>
      </div>
      
      <div class="profile-stats">
        <div class="stat-card">
          <h3>Games Played</h3>
          <p>{{ userProfile.gamesPlayed || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Average Score</h3>
          <p>{{ userProfile.averageScore || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Best Score</h3>
          <p>{{ userProfile.bestScore || 0 }}</p>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="logout" class="logout-button">Logout</button>
      </div>
    </div>
    <div v-else class="loading">
      Loading profile...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/AuthStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const userProfile = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

onMounted(async () => {
  try {
    userProfile.value = authStore.userProfile;
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.profile-actions {
  text-align: center;
}

.logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #c82333;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
