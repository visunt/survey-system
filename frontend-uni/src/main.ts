import { createSSRApp } from 'vue';
import i18n from './locales';
import { loadLocaleFromStorage, saveLocaleToStorage } from './locales';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  app.use(i18n);

  // 从缓存加载语言
  const savedLocale = loadLocaleFromStorage();
  i18n.global.locale.value = savedLocale;

  return {
    app,
  };
}

// 暴露语言切换函数
export { i18n, saveLocaleToStorage, loadLocaleFromStorage };
