import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "./providers/LanguageProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitme-nu-woad.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "FitMe — 옷 사진 한 장으로 내가 입은 모습을 확인하세요",
    template: "%s | FitMe AI",
  },
  description: "쇼핑몰에서 마음에 드는 의상을 캡처하고 본인 사진과 함께 올리면, AI가 자연스러운 피팅 컷을 만들어드립니다.",
  keywords: ["FitMe", "가상 피팅", "AI 피팅룸", "Virtual Try-On", "AI 옷 입혀보기", "AI 패션"],
  manifest: "/manifest.json",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "FitMe — 옷 사진 한 장으로 내가 입은 모습을 확인하세요",
    description: "쇼핑몰 옷 사진도 OK, 모델 샷이나 평면 샷도 자연스럽게. 클릭 한 번으로 나만의 AI 피팅룸을 경험해 보세요.",
    url: siteUrl,
    siteName: "FitMe AI",
    images: [
      {
        url: `${siteUrl}/api/og?lang=ko`,
        width: 1200,
        height: 630,
        alt: "FitMe AI Virtual Try-On",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitMe — AI Virtual Try-On",
    description: "옷 사진 한 장으로 내가 입은 모습을 확인하세요.",
    images: [`${siteUrl}/api/og?lang=ko`],
  },
  verification: {
    google: "PLACEHOLDER_GOOGLE_VERIFICATION",
    other: {
      "naver-site-verification": "PLACEHOLDER_NAVER_VERIFICATION",
    },
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FitMe — AI Virtual Try-On",
  "operatingSystem": "All",
  "applicationCategory": "MultimediaApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1280",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "FitMe AI 가상 피팅은 무료인가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "네! 브라우저당 2회 무료 피팅이 제공되며, 본인의 fal.ai API 키를 입력(BYOK)하거나 무제한 멤버십을 통해 지속적으로 이용하실 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      "name": "어떤 의상 사진을 올릴 수 있나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "쇼핑몰 모델 착용 샷, 의상 단독 촬영 샷(플랫레이), 스마트폰 캡처 이미지 모두 지원됩니다.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <meta name="google-site-verification" content="PLACEHOLDER_GOOGLE_VERIFICATION" />
        <meta name="naver-site-verification" content="PLACEHOLDER_NAVER_VERIFICATION" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
