import { createApp } from 'vue';
import router from './router';
import i18n from './locales';
import App from './App.vue';
import './styles/main.scss';

const app = createApp(App);
app.use(i18n);
app.use(router);

// Initialize locale from localStorage
const savedLocale = localStorage.getItem('locale') as 'zh' | 'en';
if (savedLocale && ['zh', 'en'].includes(savedLocale)) {
  i18n.global.locale.value = savedLocale;
  document.documentElement.lang = savedLocale;
}

app.mount('#app');
