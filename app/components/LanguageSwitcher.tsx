"use client";

import React from "react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

const languages: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 shadow-inner">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden sm:inline" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            locale === lang.code
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
