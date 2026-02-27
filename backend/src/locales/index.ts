import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';
export type Messages = typeof zh;

const locales = { zh, en };

export const DEFAULT_LOCALE: Locale = 'zh';

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return locales[locale] || locales[DEFAULT_LOCALE];
}

export function t(
  key: string,
  locale: Locale = DEFAULT_LOCALE,
  params?: Record<string, string | number>
): string {
  const messages = getMessages(locale);
  const keys = key.split('.');
  let value: any = messages;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }

  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return String(params[param] || match);
    });
  }

  return value || key;
}
