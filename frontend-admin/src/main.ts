import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import router from './router';
import i18n from './locales';
import App from './App.vue';
import './styles/main.scss';

const app = createApp(App);
const pinia = createPinia();

// Register icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(ElementPlus, { locale: zhCn });

// Sync Element Plus locale with app locale
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

import { watch } from 'vue';
watch(locale, (newLocale) => {
  if (newLocale === 'zh') {
    app.config.globalProperties.$ELEMENT_PLUS.locale = zhCn;
  } else {
    app.config.globalProperties.$ELEMENT_PLUS.locale = en;
  }
}, { immediate: true });

app.mount('#app');
