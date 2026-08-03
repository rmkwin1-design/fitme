"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("fitme_lang") as Locale | null;
      if (savedLang && (savedLang === "ko" || savedLang === "ja" || savedLang === "en")) {
        setLocaleState(savedLang);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("fitme_lang", newLocale);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const localeDict = translations[locale] || translations.ko;
    if (localeDict[key]) {
      return localeDict[key];
    }
    // Fallback to Korean
    if (translations.ko[key]) {
      return translations.ko[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
