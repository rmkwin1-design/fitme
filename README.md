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
7. **자동화 마케팅 (Vercel Cron & SNS 포스팅)**
   - **주간 SEO 블로그 자동 생성** (`/api/cron/generate-post`, 검토용 `draft: true` 태그)
   - **주 3회 소셜 미디어 자동 포스팅** (`/api/cron/social-post`, X 및 Instagram API 연동)

---

## 📱 SNS 자동 포스팅 사전 준비사항 (Social Media Setup Prerequisites)

### 1. X (Twitter) API v2 설정
- **비용 참고**: X API v2를 통해 게시글을 자동으로 올리기 위해서는 **Basic 플랜($100/월)** 이상의 유료 API 요금제가 필요합니다.
- **설정 절차**:
  1. [Twitter Developer Portal](https://developer.twitter.com) 로그인 ➔ 프로젝트 및 앱 생성
  2. User authentication settings ➔ Read and Write 권한 설정
  3. Keys and Tokens 탭에서 **`Bearer Token`** (또는 OAuth 2.0 Client ID/Secret) 발급
  4. Vercel 환경 변수에 `TWITTER_BEARER_TOKEN` 등록

### 2. Instagram Graph API 설정 (수동 승인 필수 4단계)
인스타그램 포스팅 자동화를 위해서는 Facebook 메타 Developer 앱 사전 승인이 필요합니다:
1. **계정 전환**: 인스타그램 계정을 **비즈니스(Business)** 또는 **크리에이터(Creator)** 계정으로 전환합니다.
2. **페이스북 페이지 연결**: 페이스북 페이지를 하나 만들고, 해당 인스타그램 계정과 연결합니다.
3. **Facebook Developer 앱 생성**:
   - [Meta for Developers](https://developers.facebook.com) 접속 ➔ 앱 만들기 (유형: **비즈니스**)
   - **Instagram Graph API** 제품 추가
   - App Review ➔ **`instagram_basic`** 및 **`instagram_content_publish`** 권한 승인 신청
4. **토큰 및 User ID 발급**:
   - Graph API Explorer 이용 ➔ 장기 액세스 토큰(`INSTAGRAM_ACCESS_TOKEN`) 발급
   - `GET /v18.0/me/accounts` 조회를 통해 인스타그램 User ID(`INSTAGRAM_USER_ID`) 확인 후 Vercel 환경 변수에 추가

---

## ⚙️ Vercel 배포 시 런타임 및 필수 환경 변수

### 런타임 환경 (Node.js Runtime)
* `/api/tryon` 라우트는 `@fal-ai/client` 및 Node.js `Buffer` 객체를 사용하므로 **Node.js 런타임**으로 작동합니다 (`export const runtime = "nodejs";`).

---

## 🌐 English Note

FitMe is an AI Virtual Try-On web app built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.
- **Social Media Automation**: Integrates Vercel Cron jobs (`/api/cron/social-post`) to automate promotional posts to X (Twitter v2 API) and Instagram Graph API with audit logs.

## 🇯🇵 Japanese Note

FitMeはNext.js 14（App Router）とTypeScript、Tailwind CSSで構築されたAIバーチャル試着Webアプリです。
- **SNS自動投稿**: Vercel Cron（`/api/cron/social-post`）を活用し、X（Twitter API v2）やInstagram Graph APIへの自動投稿と監査ログ機能を搭載。
