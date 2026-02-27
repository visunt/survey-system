import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: number;
  username: string;
  role: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setUser(data: User) {
    user.value = data;
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    setUser,
    setToken,
    logout,
  };
});
