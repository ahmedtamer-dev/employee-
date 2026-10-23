import { createContext, useContext, useEffect } from 'react';
import { translations, FAQ_DATA } from './translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const lang = 'ar';
  const dir = 'rtl';
  const isRtl = true;

  useEffect(() => {
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
    try {
      localStorage.removeItem('nasaq_lang');
    } catch {}
  }, []);

  const t = (key, fallback = '') => {
    return translations.ar?.[key] ?? fallback ?? key;
  };

  const faqs = FAQ_DATA.ar;

  const value = {
    lang: 'ar',
    dir: 'rtl',
    isRtl: true,
    t,
    faqs,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'ar',
      dir: 'rtl',
      isRtl: true,
      t: (key, fallback = '') => fallback || key,
      faqs: FAQ_DATA.ar,
    };
  }
  return context;
}
