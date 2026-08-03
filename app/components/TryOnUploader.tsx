"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Sparkles,
  User,
  Shirt,
  Info,
  Loader2,
  Download,
  RefreshCw,
  RotateCcw,
  Key,
  ShieldCheck,
  CreditCard,
  Crown,
} from "lucide-react";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const FREE_LIMIT = 2;

interface ImageState {
  file: File;
  previewUrl: string;
  base64: string;
}

export type GarmentType = "model" | "flat-lay";

export default function TryOnUploader() {
  const { t, locale } = useLanguage();

  const [userImage, setUserImage] = useState<ImageState | null>(null);
  const [garmentImage, setGarmentImage] = useState<ImageState | null>(null);
  const [garmentType, setGarmentType] = useState<GarmentType>("model");
  const [garmentCategory, setGarmentCategory] = useState<"auto" | "tops" | "bottoms" | "one-pieces">("auto");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  // Demo usage, BYOK & Unlimited Subscription State
  const [freeUsesCount, setFreeUsesCount] = useState<number>(0);
  const [byokKey, setByokKey] = useState<string>("");
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>("");
  const [keyInputError, setKeyInputError] = useState<string | null>(null);

  const userInputRef = useRef<HTMLInputElement>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Load localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUses = localStorage.getItem("fitme_uses");
      if (storedUses) {
        setFreeUsesCount(parseInt(storedUses, 10) || 0);
      }
      const storedKey = localStorage.getItem("fitme_byok");
      if (storedKey) {
        setByokKey(storedKey);
      }
      const storedUnlimited = localStorage.getItem("fitme_unlimited");
      if (storedUnlimited === "true") {
        setIsUnlimited(true);
      }
    }
  }, []);

  const [aspectWarning, setAspectWarning] = useState<string | null>(null);

  const processFile = (file: File, type: "user" | "garment") => {
    setError(null);
    setResultImageUrl(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("ERR_INVALID_TYPE"));
      return;
    }

    // Validate file size (under 8MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(t("ERR_FILE_TOO_LARGE"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const previewUrl = URL.createObjectURL(file);

      if (type === "user") {
        if (userImage?.previewUrl) URL.revokeObjectURL(userImage.previewUrl);
        setUserImage({ file, previewUrl, base64 });

        // Dimension heuristic check for pose warning
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const isLandscape = w > h;
          const isTightCrop = h < 450 || (w / h > 0.9 && w / h < 1.1 && h < 650);

          if (isLandscape || isTightCrop) {
            setAspectWarning(t("uploader.aspectWarning"));
          } else {
            setAspectWarning(null);
          }
        };
        img.src = previewUrl;
      } else {
        if (garmentImage?.previewUrl) URL.revokeObjectURL(garmentImage.previewUrl);
        setGarmentImage({ file, previewUrl, base64 });
      }
    };

    reader.onerror = () => {
      setError(t("ERR_READ_FILE"));
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "user" | "garment"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0], type);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    type: "user" | "garment"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    processFile(files[0], type);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = (type: "user" | "garment") => {
    setError(null);
    setResultImageUrl(null);
    if (type === "user") {
      if (userImage?.previewUrl) URL.revokeObjectURL(userImage.previewUrl);
      setUserImage(null);
      if (userInputRef.current) userInputRef.current.value = "";
    } else {
      if (garmentImage?.previewUrl) URL.revokeObjectURL(garmentImage.previewUrl);
      setGarmentImage(null);
      if (garmentInputRef.current) garmentInputRef.current.value = "";
    }
  };

  const handleResetGarment = () => {
    if (garmentImage?.previewUrl) URL.revokeObjectURL(garmentImage.previewUrl);
    setGarmentImage(null);
    setResultImageUrl(null);
    setError(null);
    if (garmentInputRef.current) garmentInputRef.current.value = "";
  };

  const handleSaveByokKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    if (!trimmed) {
      setKeyInputError(t("ERR_NO_KEY"));
      return;
    }
    setByokKey(trimmed);
    localStorage.setItem("fitme_byok", trimmed);
    setCustomKeyInput("");
    setKeyInputError(null);
    setIsLimitModalOpen(false);
  };

  const handleClearByokKey = () => {
    setByokKey("");
    localStorage.removeItem("fitme_byok");
  };

  const handleCheckout = async (provider: "primary" | "paypal") => {
    try {
      setIsPaymentLoading(true);
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "unlimited",
          locale,
          provider,
          originUrl: window.location.origin,
        }),
      });

      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!userImage || !garmentImage || isLoading) return;

    // Check limit if not using BYOK or Unlimited plan
    if (!byokKey && !isUnlimited && freeUsesCount >= FREE_LIMIT) {
      setIsLimitModalOpen(true);
      return;
    }

    setError(null);
    setIsLoading(true);
    setResultImageUrl(null);

    // Scroll to result view
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (byokKey) {
        headers["x-fal-key"] = byokKey;
      }

      const response = await fetch("/api/tryon", {
        method: "POST",
        headers,
        body: JSON.stringify({
          personImageBase64: userImage.base64,
          garmentImageBase64: garmentImage.base64,
          garmentPhotoType: garmentType,
          garmentCategory,
          isPaidUser: isUnlimited || !!byokKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorKey = data.errorCode || data.error;
        throw new Error(t(errorKey, t("ERR_SERVER_ERROR")));
      }

      const requestId = data.requestId;
      if (!requestId) {
        throw new Error(t("ERR_GENERATE_FAILED"));
      }

      // Poll status every 2 seconds until COMPLETED or error
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 45; // Max 90 seconds polling

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusResp = await fetch(`/api/tryon/status/${requestId}`, {
          headers: byokKey ? { "x-fal-key": byokKey } : {},
        });

        const statusData = await statusResp.json();

        if (!statusResp.ok || statusData.status === "FAILED") {
          const errorKey = statusData.errorCode || statusData.error;
          throw new Error(t(errorKey, t("ERR_SERVER_ERROR")));
        }

        if (statusData.status === "COMPLETED" && statusData.imageUrl) {
          isDone = true;
          setResultImageUrl(statusData.imageUrl);

          // If not using BYOK or Unlimited, increment demo uses counter
          if (!byokKey && !isUnlimited) {
            const newCount = freeUsesCount + 1;
            setFreeUsesCount(newCount);
            localStorage.setItem("fitme_uses", String(newCount));
          }
        }
      }

      if (!isDone) {
        throw new Error(t("ERR_GENERATE_FAILED"));
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("ERR_SERVER_ERROR");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!resultImageUrl) return;
    try {
      const resp = await fetch(resultImageUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fitme-tryon.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultImageUrl, "_blank");
    }
  };

  const isFormValid = !!userImage && !!garmentImage && !error && !isLoading;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xl p-6 sm:p-10 transition-all relative">
      {/* Top Banner: Free Usage Counter, BYOK, or Unlimited Badge */}
      <div className="flex items-center justify-between gap-2 mb-6 p-3.5 rounded-xl bg-slate-100/80 text-xs sm:text-sm text-slate-600 border border-slate-200/60 shadow-inner">
        {isUnlimited ? (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 font-bold text-amber-600">
              <Crown className="w-4 h-4 text-amber-500" />
              FitMe Unlimited Premium Active
            </span>
          </div>
        ) : byokKey ? (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 font-medium text-indigo-700">
              <Key className="w-4 h-4 text-indigo-600" />
              {t("banner.byokActive")}
            </span>
            <button
              onClick={handleClearByokKey}
              className="text-xs text-slate-400 hover:text-rose-600 underline transition-colors"
            >
              {t("banner.removeKey")}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t("banner.freeUses")}{" "}
              <strong className="text-indigo-600 font-bold">{freeUsesCount}</strong> / {FREE_LIMIT}{t("banner.usesCount")}
            </span>
            <button
              onClick={() => setIsLimitModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              {t("banner.registerKey")}
            </button>
          </div>
        )}
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t("uploader.tag")}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {t("uploader.title")}
        </h2>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          {t("uploader.subtitle")}
        </p>
      </div>

      {/* Graceful Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Aspect Ratio & Tight Crop Soft Warning Banner */}
      {aspectWarning && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>{aspectWarning}</span>
          </div>
          <button
            onClick={() => setAspectWarning(null)}
            className="p-1 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Image Upload Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 1. 내 사진 업로드 카드 */}
        <div className="flex flex-col">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              {t("uploader.userImageLabel")}{" "}
              <span className="text-xs text-indigo-600 font-normal">
                {t("uploader.required")}
              </span>
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {t("uploader.maxSize")}
            </span>
          </label>

          <input
            type="file"
            ref={userInputRef}
            onChange={(e) => handleFileChange(e, "user")}
            accept="image/*"
            disabled={isLoading}
            className="hidden"
          />

          {!userImage ? (
            <div
              onClick={() => !isLoading && userInputRef.current?.click()}
              onDrop={(e) => !isLoading && handleDrop(e, "user")}
              onDragOver={handleDragOver}
              className={`flex-1 min-h-[240px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center transition-all ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer group"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                {t("uploader.userDropzoneText")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t("uploader.userDropzoneSub")}
              </p>
            </div>
          ) : (
            <div className="relative min-h-[240px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group flex items-center justify-center p-2">
              <img
                src={userImage.previewUrl}
                alt="My Photo"
                className="max-h-[260px] w-auto object-contain rounded-xl shadow-sm"
              />
              {!isLoading && (
                <button
                  onClick={() => removeImage("user")}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md hover:scale-105"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {userImage.file.name.length > 18
                  ? `${userImage.file.name.slice(0, 15)}...`
                  : userImage.file.name}
              </div>
            </div>
          )}
        </div>

        {/* 2. 옷 사진 업로드 카드 */}
        <div className="flex flex-col">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-800 mb-2">
            <span className="flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-purple-500" />
              {t("uploader.garmentImageLabel")}{" "}
              <span className="text-xs text-purple-600 font-normal">
                {t("uploader.required")}
              </span>
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {t("uploader.maxSize")}
            </span>
          </label>

          <input
            type="file"
            ref={garmentInputRef}
            onChange={(e) => handleFileChange(e, "garment")}
            accept="image/*"
            disabled={isLoading}
            className="hidden"
          />

          {!garmentImage ? (
            <div
              onClick={() => !isLoading && garmentInputRef.current?.click()}
              onDrop={(e) => !isLoading && handleDrop(e, "garment")}
              onDragOver={handleDragOver}
              className={`flex-1 min-h-[240px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center transition-all ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-purple-400 hover:bg-purple-50/20 cursor-pointer group"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 group-hover:text-purple-600 transition-colors">
                {t("uploader.garmentDropzoneText")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t("uploader.garmentDropzoneSub")}
              </p>
            </div>
          ) : (
            <div className="relative min-h-[240px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group flex items-center justify-center p-2">
              <img
                src={garmentImage.previewUrl}
                alt="Garment Photo"
                className="max-h-[260px] w-auto object-contain rounded-xl shadow-sm"
              />
              {!isLoading && (
                <button
                  onClick={() => removeImage("garment")}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md hover:scale-105"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {garmentImage.file.name.length > 18
                  ? `${garmentImage.file.name.slice(0, 15)}...`
                  : garmentImage.file.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Garment Type Toggle Selector */}
      <div className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            {t("garmentType.title")}
          </span>
          <span className="text-xs text-slate-400">{t("garmentType.sub")}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setGarmentType("model")}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
              garmentType === "model"
                ? "bg-white text-indigo-600 border-indigo-200 shadow-sm ring-2 ring-indigo-500/10"
                : "bg-slate-100/70 text-slate-600 border-transparent hover:bg-white/80"
            } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <User className="w-4 h-4" />
            <span>{t("garmentType.model")}</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => setGarmentType("flat-lay")}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
              garmentType === "flat-lay"
                ? "bg-white text-indigo-600 border-indigo-200 shadow-sm ring-2 ring-indigo-500/10"
                : "bg-slate-100/70 text-slate-600 border-transparent hover:bg-white/80"
            } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <Shirt className="w-4 h-4" />
            <span>{t("garmentType.flatLay")}</span>
          </button>
        </div>

        {/* Garment Category Selector */}
        <div className="pt-3 border-t border-slate-200/60">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            {t("garmentCategory.title")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["auto", "tops", "bottoms", "one-pieces"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                disabled={isLoading}
                onClick={() => setGarmentCategory(cat)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-center border ${
                  garmentCategory === cat
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                } ${isLoading ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {t(`garmentCategory.${cat === "one-pieces" ? "onePieces" : cat}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col items-center mb-4">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleGenerate}
          className={`w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-2xl font-bold text-base transition-all duration-200 shadow-lg flex items-center justify-center gap-2.5 ${
            isFormValid
              ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t("btn.generating")}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t("btn.generate")}</span>
            </>
          )}
        </button>

        {!isFormValid && !isLoading && (
          <p className="text-xs text-slate-400 mt-2.5 text-center">
            {t("uploader.hint")}
          </p>
        )}
      </div>

      {/* Target Result Scroll Anchor */}
      <div ref={resultRef} />

      {/* Loading Skeleton View */}
      {isLoading && (
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{t("loading.title")}</span>
            </div>
            <p className="text-xs text-slate-500">{t("loading.sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Original Skeleton */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 mb-3 px-3 py-1 bg-slate-100 rounded-full">
                {t("result.original")}
              </span>
              <div className="w-full h-72 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                {userImage && (
                  <img
                    src={userImage.previewUrl}
                    alt="Original"
                    className="max-h-full w-auto object-contain rounded-lg opacity-80"
                  />
                )}
              </div>
            </div>

            {/* Right Card: Result Skeleton */}
            <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-md flex flex-col items-center relative overflow-hidden">
              <span className="text-xs font-bold text-indigo-600 mb-3 px-3 py-1 bg-indigo-50 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t("result.tryOnResult")}
              </span>
              <div className="w-full h-72 rounded-xl bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-indigo-100/50 animate-pulse flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  {t("loading.rendering")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Before / After Result Display Section */}
      {resultImageUrl && !isLoading && (
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 border border-indigo-200/80 shadow-xl animate-fadeIn">
          {/* Header Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {t("result.badge")}
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {t("result.title")}
            </h3>
            <p className="text-xs sm:text-base text-slate-500 mt-1">
              {t("result.sub")}
            </p>
          </div>

          {/* Before / After Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Card: 원본 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md flex flex-col items-center">
              <span className="text-xs font-bold text-slate-700 mb-3 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                {t("result.original")}
              </span>
              <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-900/5 flex items-center justify-center p-2">
                {userImage && (
                  <img
                    src={userImage.previewUrl}
                    alt="Original"
                    className="max-h-full w-auto object-contain rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Right Card: 가상 피팅 결과 */}
            <div className="bg-white rounded-2xl p-4 border-2 border-indigo-500/80 shadow-xl flex flex-col items-center relative group">
              <span className="text-xs font-bold text-indigo-700 mb-3 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {t("result.tryOnResult")}
              </span>
              <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-900/5 flex items-center justify-center p-2">
                <img
                  src={resultImageUrl}
                  alt="Try-On Result"
                  className="max-h-full w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* PNG 다운로드 Button */}
            <button
              onClick={handleDownloadPng}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t("btn.downloadPng")}</span>
            </button>

            {/* 다시 생성 Button */}
            <button
              onClick={handleGenerate}
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-purple-500/25 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t("btn.reGenerate")}</span>
            </button>

            {/* 다른 옷 입혀보기 Button */}
            <button
              onClick={handleResetGarment}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-300 transition-all shadow-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("btn.changeGarment")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Free Demo Limit Reached Korean Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsLimitModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {t("modal.title")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t("modal.sub")}
              </p>
            </div>

            {/* Option A: BYOK */}
            <div className="mb-6 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t("modal.optionA")}
                </h4>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                {t("modal.optionADesc")}
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder={t("modal.placeholder")}
                  value={customKeyInput}
                  onChange={(e) => {
                    setCustomKeyInput(e.target.value);
                    setKeyInputError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                {keyInputError && (
                  <p className="text-xs text-rose-600">{keyInputError}</p>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveByokKey(customKeyInput)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  {t("modal.saveBtn")}
                </button>
              </div>

              {/* Security Privacy Note */}
              <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500 leading-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{t("modal.privacyNote")}</span>
              </div>
            </div>

            {/* Option B: Multi-Locale Auto-Routing Payment Checkout */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t("modal.optionB")}
                </h4>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                {t("modal.optionBDesc")}
              </p>

              <div className="flex flex-col gap-2.5">
                {/* Primary Payment Button per Locale */}
                <button
                  type="button"
                  disabled={isPaymentLoading}
                  onClick={() => handleCheckout("primary")}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPaymentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>
                    {locale === "ko"
                      ? t("payment.tossBtn")
                      : locale === "ja"
                      ? t("payment.stripeJaBtn")
                      : t("payment.stripeEnBtn")}
                  </span>
                </button>

                {/* Secondary Payment Button: PayPal */}
                <button
                  type="button"
                  disabled={isPaymentLoading}
                  onClick={() => handleCheckout("paypal")}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t("payment.paypalBtn")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
