import { defineI18n } from 'vue-i18n';
import zh from './zh';
import en from './en';

export type Locale = 'zh' | 'en';

const messages = {
  zh,
  en,
};

const i18n = createI18n({
  legacy: false,
  locale: 'zh', // 默认中文
  fallbackLocale: 'zh',
  messages,
});

export default i18n;

export const availableLocales: { value: Locale; label: string }[] = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
];

export const localeLabels: Record<Locale, string> = {
  zh: '简体中文',
  en: 'English',
};

// 从缓存加载语言
export function loadLocaleFromStorage(): Locale {
  return uni.getStorageSync('locale') as Locale || 'zh';
}

// 保存语言到缓存
export function saveLocaleToStorage(locale: Locale): void {
  uni.setStorageSync('locale', locale);
}
