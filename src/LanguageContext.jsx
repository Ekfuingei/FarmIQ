import { createContext, useContext, useState, useEffect } from 'react';
import { translations, languageNames } from './translations';

const STORAGE_KEY = 'farmiq_lang';
const WALKTHROUGH_KEY = 'farmiq_walkthrough';
const LARGE_TEXT_KEY = 'farmiq_large_text';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  });
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  });
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(() => {
    return !!localStorage.getItem(WALKTHROUGH_KEY);
  });
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem(LARGE_TEXT_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle('large-text', largeText);
    localStorage.setItem(LARGE_TEXT_KEY, largeText);
  }, [largeText]);

  const completeWalkthrough = () => {
    localStorage.setItem(WALKTHROUGH_KEY, '1');
    setHasSeenWalkthrough(true);
  };

  const t = (key) => {
    const text = (translations[lang] || translations.en)[key];
    return text ?? (translations.en[key] ?? key);
  };

  const tWithParams = (key, params) => {
    let text = t(key);
    Object.entries(params || {}).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  };

  const completeOnboarding = (selectedLang) => {
    setLang(selectedLang);
    setHasOnboarded(true);
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang: changeLanguage,
        t,
        tWithParams,
        hasOnboarded,
        completeOnboarding,
        hasSeenWalkthrough,
        completeWalkthrough,
        largeText,
        setLargeText,
        languageNames,
        languages: Object.keys(languageNames),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
