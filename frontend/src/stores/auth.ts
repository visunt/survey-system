import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(userData: User, authToken: string) {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function loadAuth() {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser);
      token.value = savedToken;
    }
  }

  loadAuth();

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setAuth,
    clearAuth,
    loadAuth,
  };
});
