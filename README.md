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

---

## ⚙️ Vercel 배포 시 런타임 및 필수 환경 변수 (Runtime & Env Vars)

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

## 🚀 Vercel 배포 가이드 (Vercel Deployment Steps)

### 단계 1: 깃허브(GitHub) 저장소에 코드 올리기

터미널에서 아래 명령어들을 실행합니다:

```bash
# 깃 저장소 초기화 (미생성 시)
git init

# 파일 스테이징 및 커밋
git add .
git commit -m "feat: Prepare FitMe project for Vercel deployment"

# GitHub 브랜치 설정 및 푸시 (본인의 저장소 URL 입력)
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/fitme.git
git push -u origin main
```

### 단계 2: Vercel 대시보드에서 새 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속 후 로그인
2. **"Add New..."** → **"Project"** 클릭
3. 위에서 푸시한 GitHub 저장소(`fitme`)를 **Import** 합니다.

### 단계 3: 환경 변수(Environment Variables) 입력하기

1. Vercel 프로젝트 설정 화면의 **"Environment Variables"** 섹션을 엽니다.
2. 아래 항목들을 등록합니다:
   - **Key**: `FAL_KEY` / **Value**: 본인의 Fal.ai API 키
   - **Key**: `PAYPAL_CLIENT_ID` / **Value**: 본인의 PayPal Client ID
   - **Key**: `PAYPAL_CLIENT_SECRET` / **Value**: 본인의 PayPal Secret Key
3. **"Deploy"** 버튼을 눌러 배포를 완료합니다!

---

## 🌐 English Note

FitMe is an AI Virtual Try-On web app built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.
- **Node.js Runtime**: `/api/tryon` relies on `@fal-ai/client` and Node.js `Buffer`, so it explicitly runs on the Node.js runtime (`export const runtime = "nodejs";`).
- **Required Env Var**: Set `FAL_KEY` in Vercel Project Settings > Environment Variables. Never commit secret keys to repository.

## 🇯🇵 Japanese Note

FitMeはNext.js 14（App Router）とTypeScript、Tailwind CSSで構築されたAIバーチャル試着Webアプリです。
- **Node.jsランタイム**: `/api/tryon`は`@fal-ai/client`およびNode.jsの`Buffer`を使用するため、Node.jsランタイム（`export const runtime = "nodejs";`）で動作します。
- **必須環境変数**: Vercel Project Settings > Environment Variablesにて`FAL_KEY`を設定してください（`.env.local`はGitにコミットしないでください）。
