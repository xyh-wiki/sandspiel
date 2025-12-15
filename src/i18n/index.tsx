import React, { createContext, useContext, useMemo, useState } from 'react';
import en from './en';
import zh from './zh';

export type Locale = 'en' | 'zh';
export type TranslationKey = keyof typeof en;

const STORAGE_KEY = 'sandspiel_language';
const dictionaries: Record<Locale, Record<string, string>> = { en, zh } as const;

const getNavigatorLanguage = (): Locale => {
  if (typeof navigator === 'undefined') return 'en';
  const preferred = navigator.languages ?? [navigator.language];
  const match = preferred
    .map((l) => l.toLowerCase())
    .find((l) => l.startsWith('zh') || l.startsWith('en'));
  if (!match) return 'en';
  return match.startsWith('zh') ? 'zh' : 'en';
};

export const detectLanguage = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && stored in dictionaries) return stored;
  return getNavigatorLanguage();
};

export const bootstrapLanguage = (): Locale => {
  const lang = detectLanguage();
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
  return lang;
};

interface I18nContextValue {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => undefined,
  t: (key: TranslationKey) => en[key] ?? key
});

export const I18nProvider: React.FC<{ initialLanguage?: Locale; children: React.ReactNode }> = ({
  initialLanguage,
  children
}) => {
  const [language, setLanguageState] = useState<Locale>(initialLanguage ?? detectLanguage());

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  const t = useMemo(
    () =>
      (key: TranslationKey) => {
        return dictionaries[language]?.[key] ?? dictionaries.en[key] ?? key;
      },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
