<template>
  <view id="app">
    <view v-if="showLangSwitch" class="lang-switch">
      <text
        v-for="loc in availableLocales"
        :key="loc.value"
        :class="{ active: currentLocale === loc.value }"
        @tap="changeLocale(loc.value)"
      >
        {{ loc.label }}
      </text>
    </view>
    <!-- Pages will be rendered here -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useI18n } from 'vue-i18n';
import { availableLocales, saveLocaleToStorage, loadLocaleFromStorage } from './locales';

const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);

// 显示语言切换（非登录页面）
const showLangSwitch = ref(false);

onLaunch(() => {
  console.log('App Launch');
});

onShow(() => {
  console.log('App Show');
  // 初始化语言
  const savedLocale = loadLocaleFromStorage();
  locale.value = savedLocale;
});

onHide(() => {
  console.log('App Hide');
});

// 监听路由变化，在问卷页面显示语言切换
onMounted(() => {
  const pages = getCurrentPages();
  showLangSwitch.value = pages.some(page => page.route?.startsWith('pages/survey'));
});

function changeLocale(newLocale: string) {
  locale.value = newLocale as 'zh' | 'en';
  saveLocaleToStorage(newLocale as 'zh' | 'en');
}
</script>

<style lang="scss">
@import '@/styles/main.scss';

#app {
  width: 100%;
  height: 100%;
}

.lang-switch {
  position: fixed;
  top: 20rpx;
  right: 20rpx;
  z-index: 1000;
  display: flex;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

  text {
    padding: 8rpx 20rpx;
    border-radius: 24rpx;
    font-size: 26rpx;
    color: #999;
    transition: all 0.2s;

    &.active {
      color: #667eea;
      background-color: #f0f4ff;
    }
  }
}
</style>
