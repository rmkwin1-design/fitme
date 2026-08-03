"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { CheckCircle2, Sparkles, Shirt } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const orderId = searchParams.get("order_id") || "fitme_demo_order";

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fitme_unlimited", "true");
    }
  }, []);

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 text-center animate-fadeIn">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      {/* Title & Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        FitMe Premium Member
      </span>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
        {t("payment.successTitle")}
      </h1>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        {t("payment.successSub")}
      </p>

      {/* Order Details */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 mb-6 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t("payment.orderId")}</span>
          <span className="font-mono font-semibold text-slate-800">{orderId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Status:</span>
          <span className="font-semibold text-emerald-600">Active (Unlimited)</span>
        </div>
      </div>

      {/* Return Button */}
      <button
        onClick={() => router.push("/")}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
      >
        <Shirt className="w-5 h-5" />
        <span>{t("payment.backToStudio")}</span>
      </button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-50 p-4 sm:p-6 text-slate-900">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
