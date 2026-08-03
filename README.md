# 👔 FitMe — AI 가상 피팅룸 (AI Virtual Try-On)

> "옷 사진 한 장으로 내가 입은 모습을 확인하세요"

FitMe는 사용자의 본인 사진과 입어보고 싶은 옷 사진 2장을 업로드하여 AI 기반으로 자연스러운 착용 모습을 생성해 주는 웹 애플리케이션입니다.

---

## ✨ 핵심 기능

1. **AI 가상 피팅 (Fal.ai v1.6 연동)**
   - 모델 착용 샷 / 플랫레이(옷 단독) 사진 종류 선택 지원
   - 실시간 이미지 업로드 및 유효성 검사 (최대 8MB, 이미지 포맷)
2. **비포 / 애프터 (Before/After) 비교 뷰**
   - 원본 사진과 AI 피팅 결과를 고화질 카드 형태 비교
   - 결과 이미지 PNG 다운로드, 다시 생성, 다른 옷 입혀보기 제공
3. **3개 국어 다국어 (i18n) 지원**
   - 한국어 (`ko`), 일본어 (`ja`), 영어 (`en`) 실시간 전환 지원 (`localStorage` 선택 기억)
4. **무료 체험 횟수 제한 & BYOK (Bring Your Own Key)**
   - 브라우저당 2회 무료 체험 제공 (`localStorage` 카운트)
   - 소진 시 본인 fal.ai API 키 입력 모달 제공 (무제한 사용, 서버 저장 X)
5. **글로벌 자동 라우팅 결제 레이어**
   - `ko`: 토스페이먼츠 (Primary) / PayPal (Secondary)
   - `ja`: Stripe Checkout (PayPay, 편의점 Konbini, 카드) / PayPal (Secondary)
   - `en`: Stripe Checkout (Apple Pay, Google Pay, Cards) / PayPal (Secondary)
6. **SEO & PWA 기본 탑재**
   - `sitemap.ts`, `robots.ts`, `manifest.json` (모바일 홈 화면 추가 PWA 지원)
   - 다국어 동적 Open Graph 이미지 생성 (`/api/og`)
   - 구글 서치콘솔 및 네이버 서치어드바이저 소유 확인 태그 지원

---

## 🌐 커스텀 도메인 연결 가이드 (Custom Domain Setup)

가비아(Gabia), Namecheap, 도메인한국 등에서 구입한 커스텀 도메인을 연결하는 방법:

1. **Vercel 설정**:
   - Vercel 대시보드 ➔ **`fitme` 프로젝트** ➔ **[Settings]** ➔ **[Domains]** 메뉴로 이동
   - 본인의 도메인(예: `fitme.co.kr` 또는 `fitme.app`)을 입력하고 **Add** 클릭
2. **도메인 구매처(가비아/Namecheap 등) DNS 설정**:
   - **루트 도메인 (예: `fitme.app`)**:
     - 레코드 타입: **A Record**
     - 이름/호스트: `@`
     - 값/IP: **`76.76.21.21`**
   - **서브 도메인 (예: `www.fitme.app`)**:
     - 레코드 타입: **CNAME**
     - 이름/호스트: `www`
     - 값/Target: **`cname.vercel-dns.com`**

---

## 🚀 배포 후 포털 검색등록 체크리스트 (Post-Deploy Checklist)

도메인을 연결했거나 라이브 사이트 배포 후 포털 검색 노출을 위한 체크리스트:

### 1. 구글 서치콘솔 (Google Search Console)
1. [Google Search Console](https://search.google.com/search-console) 접속 및 로그인
2. 속성 추가 ➔ **URL 접두사**에 `https://fitme-nu-woad.vercel.app` (또는 커스텀 도메인) 입력
3. 소유권 확인 방식 중 **HTML 태그** 선택 ➔ `<meta name="google-site-verification" content="..." />` 값 복사
4. [app/layout.tsx](file:///d:/AI%20가상%20피팅룸/fitme/app/layout.tsx)의 `PLACEHOLDER_GOOGLE_VERIFICATION` 위치에 붙여넣고 재배포
5. 좌측 **Sitemaps** 메뉴에서 `sitemap.xml` 제출

### 2. 네이버 서치어드바이저 (Naver Search Advisor)
1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속 및 로그인
2. **웹마스터 도구** ➔ 사이트 등록 (`https://fitme-nu-woad.vercel.app`)
3. **HTML 태그** 선택 ➔ `<meta name="naver-site-verification" content="..." />` 값 복사
4. [app/layout.tsx](file:///d:/AI%20가상%20피팅룸/fitme/app/layout.tsx)의 `PLACEHOLDER_NAVER_VERIFICATION` 위치에 붙여넣고 재배포
5. **요청 ➔ 사이트맵 제출**에서 `sitemap.xml` 입력 및 제출

### 3. 빙 웹마스터 툴 (Bing Webmaster Tools)
1. [Bing Webmaster Tools](https://www.bing.com/webmasters) 접속
2. **구글 서치콘솔 연동으로 가져오기(Import)**를 누르면 1초 만에 자동 등록 완료!

---

## ⚙️ Vercel 배포 시 런타임 및 필수 환경 변수

### 1. 런타임 환경 (Node.js Runtime)
* `/api/tryon` 라우트는 `@fal-ai/client` 및 Node.js `Buffer` 객체를 사용하므로 Edge 런타임이 아닌 **Node.js 런타임**으로 작동합니다 (`export const runtime = "nodejs";`).

### 2. 필수 환경 변수 (Vercel Project Settings > Environment Variables)
⚠️ **보안 주의**: `.env.local` 파일은 절대 Git 커밋에 포함되지 않으며, Vercel 대시보드에서 직접 입력해야 합니다.

| 환경 변수 이름 | 필수 여부 | 설명 |
| :--- | :---: | :--- |
| `FAL_KEY` | **필수** | Fal.ai API 키 (AI 피팅 이미지 생성용) |
| `PAYPAL_CLIENT_ID` | 선택 | PayPal 결제용 Client ID |
| `PAYPAL_CLIENT_SECRET` | 선택 | PayPal 결제용 Secret Key |
| `TOSS_SECRET_KEY` | 선택 | 한국 토스페이먼츠 결제용 시크릿 키 |
| `STRIPE_SECRET_KEY` | 선택 | 미국/글로벌 및 일본 Stripe 결제용 시크릿 키 |

---

## 🌐 English Note

FitMe is an AI Virtual Try-On web app built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.
- **SEO & PWA**: Features `app/sitemap.ts`, `app/robots.ts`, `public/manifest.json` (PWA Add to Home Screen), and dynamic Open Graph image generation (`/api/og`).
- **Node.js Runtime**: `/api/tryon` explicitly runs on the Node.js runtime (`export const runtime = "nodejs";`).

## 🇯🇵 Japanese Note

FitMeはNext.js 14（App Router）とTypeScript、Tailwind CSSで構築されたAIバーチャル試着Webアプリです。
- **SEO・PWA**: `app/sitemap.ts`、`app/robots.ts`、`public/manifest.json`（PWAホーム画面追加）、動的OGP画像生成（`/api/og`）に対応。
- **Node.jsランタイム**: `/api/tryon`はNode.jsランタイム（`export const runtime = "nodejs";`）で動作します。
