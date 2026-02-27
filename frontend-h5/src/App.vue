<template>
  <div id="app">
    <div v-if="showLangSwitch" class="lang-switch">
      <span
        v-for="loc in availableLocales"
        :key="loc.value"
        :class="{ active: currentLocale === loc.value }"
        @click="changeLocale(loc.value)"
      >
        {{ loc.label }}
      </span>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { availableLocales, localeLabels } from './locales';

const route = useRoute();
const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);

// Show language switch on survey pages
const showLangSwitch = computed(() => route.path.startsWith('/survey/'));

function changeLocale(newLocale: string) {
  locale.value = newLocale as 'zh' | 'en';
  localStorage.setItem('locale', newLocale);
  document.documentElement.lang = newLocale;
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.lang-switch {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  span {
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    transition: all 0.2s;
    color: #999;

    &:hover {
      background-color: #f0f4ff;
    }

    &.active {
      color: #667eea;
      background-color: #e8edff;
    }
  }
}
</style>
