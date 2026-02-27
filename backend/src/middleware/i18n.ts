import { Request, Response, NextFunction } from 'express';
import { t, Locale, DEFAULT_LOCALE } from '../locales';

export interface I18nRequest extends Request {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const i18nMiddleware = (
  req: I18nRequest,
  res: Response,
  next: NextFunction
) => {
  // Get locale from header, query, or cookie
  let locale: Locale = DEFAULT_LOCALE;

  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const browserLang = acceptLanguage.split(',')[0].split('-')[0];
    if (browserLang === 'en') {
      locale = 'en';
    } else if (browserLang === 'zh') {
      locale = 'zh';
    }
  }

  // Check query parameter
  const queryLang = req.query.lang as Locale;
  if (queryLang && ['zh', 'en'].includes(queryLang)) {
    locale = queryLang;
  }

  // Check cookie
  const cookieLang = req.cookies?.lang as Locale;
  if (cookieLang && ['zh', 'en'].includes(cookieLang)) {
    locale = cookieLang;
  }

  req.locale = locale;
  req.t = (key, params) => t(key, locale, params);

  // Set locale cookie
  if (req.cookies?.lang !== locale) {
    res.cookie('lang', locale, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false,
      sameSite: 'lax',
    });
  }

  // Add locale to response headers
  res.setHeader('Content-Language', locale);

  next();
};

export const requireLocale = (req: I18nRequest): Locale => {
  return req.locale || DEFAULT_LOCALE;
};
