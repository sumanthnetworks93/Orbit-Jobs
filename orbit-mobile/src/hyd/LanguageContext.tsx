import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLang, setLang as persistLang, t, type Lang } from './i18n';

type Value = {
  lang: Lang;
  copy: ReturnType<typeof t>;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<Value | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    getLang().then(setLangState).catch(() => undefined);
  }, []);

  const value = useMemo<Value>(
    () => ({
      lang,
      copy: t(lang),
      setLang: (next) => {
        setLangState(next);
        void persistLang(next);
      },
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { lang: 'en' as Lang, copy: t('en'), setLang: (_lang: Lang) => undefined };
  }
  return context;
}
