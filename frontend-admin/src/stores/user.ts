import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Locale } from '../locales';

interface User {
  id: number;
  username: string;
  role: string;
}

export const useUserStore = defineStore('user', () => {
  const { locale } = useI18n();

  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const currentLocale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'zh');

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

  function setLocale(newLocale: Locale) {
    currentLocale.value = newLocale;
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  }

  return {
    user,
    token,
    currentLocale,
    isLoggedIn,
    isAdmin,
    setUser,
    setToken,
    logout,
    setLocale,
  };
});
