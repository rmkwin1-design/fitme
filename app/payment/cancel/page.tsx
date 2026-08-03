"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-rose-50/20 to-slate-50 p-4 sm:p-6 text-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 text-center animate-fadeIn">
        {/* Cancel Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <XCircle className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          {t("payment.cancelTitle")}
        </h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {t("payment.cancelSub")}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t("payment.retryBtn")}</span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("payment.backToStudio")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
