"use client";

import TryOnUploader from "./components/TryOnUploader";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./providers/LanguageProvider";
import { Sparkles, Shirt, Wand2, ArrowRight, Camera } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-50 text-slate-900">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Shirt className="w-4 h-4" />
            </div>
            <span>{t("app.title")}</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <a
              href="#try-on"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
            >
              {t("nav.tryOn")}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Centered Hero Section */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs sm:text-sm font-medium border border-indigo-200/60 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight mb-6">
            {t("hero.headline1")}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
              {t("hero.headline2")}
            </span>
            {t("hero.headline3")}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subheadline")}
          </p>

          {/* Primary CTA Button */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="#try-on"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span>{t("hero.cta")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>

        {/* Interactive Try-On Uploader Section */}
        <section id="try-on" className="py-10 px-4 sm:px-6">
          <TryOnUploader />
        </section>

        {/* How It Works / Key Features Grid */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
              {t("howItWorks.tag")}
            </h3>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t("howItWorks.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("howItWorks.step1Title")}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("howItWorks.step1Desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shirt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("howItWorks.step2Title")}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("howItWorks.step2Desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("howItWorks.step3Title")}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t("howItWorks.step3Desc")}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-700">
            {t("footer.brand")}
          </div>
          <div>
            © {new Date().getFullYear()} {t("footer.copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
