export type Locale = "ko" | "ja" | "en";

export const translations: Record<Locale, Record<string, string>> = {
  ko: {
    // App & Header
    "app.title": "FitMe",
    "app.subtitle": "AI Virtual Try-On",
    "nav.tryOn": "가상 피팅 시작하기",

    // Hero Section
    "hero.badge": "차세대 AI 기반 가상 착용 서비스",
    "hero.headline1": "옷 사진 한 장으로 ",
    "hero.headline2": "내가 입은 모습",
    "hero.headline3": "을 확인하세요",
    "hero.subheadline":
      "쇼핑몰에서 마음에 드는 의상을 캡처하고 본인 사진과 함께 올리면, AI가 자연스러운 피팅 컷을 만들어드립니다.",
    "hero.cta": "가상으로 입어보기",

    // How It Works
    "howItWorks.tag": "HOW IT WORKS",
    "howItWorks.title": "FitMe를 사용하는 가장 단순한 3단계",
    "howItWorks.step1Title": "1. 내 사진 업로드",
    "howItWorks.step1Desc": "전신이나 상반신이 선명하게 나온 본인 사진을 업로드합니다.",
    "howItWorks.step2Title": "2. 입어볼 의상 선택",
    "howItWorks.step2Desc": "쇼핑몰 이미지 캡처 샷이나 평면 옷 사진 등을 자유롭게 올려주세요.",
    "howItWorks.step3Title": "3. AI 가상 피팅 확인",
    "howItWorks.step3Desc":
      "인공지능이 몸의 구도와 옷의 질감을 계산하여 실감 나는 착용 컷을 생성합니다.",

    // Uploader Component
    "uploader.tag": "AI 가상 피팅 스튜디오",
    "uploader.title": "두 장의 사진으로 완료하는 가상 피팅",
    "uploader.subtitle": "본인 사진과 착용해보고 싶은 옷 사진을 올려주세요.",
    "uploader.userImageLabel": "1. 내 사진",
    "uploader.garmentImageLabel": "2. 옷 사진",
    "uploader.required": "(필수)",
    "uploader.maxSize": "최대 8MB",
    "uploader.userDropzoneText": "내 사진 드래그 또는 클릭하여 업로드",
    "uploader.userDropzoneSub": "전신 또는 상반신이 잘 보이는 사진 추천",
    "uploader.garmentDropzoneText": "옷 사진 드래그 또는 클릭하여 업로드",
    "uploader.garmentDropzoneSub":
      "쇼핑몰 캡처, 모델 착용 샷, 옷 단독 샷 모두 가능",
    "uploader.hint": "내 사진과 옷 사진 두 장을 모두 선택하면 버튼이 활성화됩니다.",

    // Garment Type
    "garmentType.title": "의상 사진 종류 선택",
    "garmentType.sub": "피팅 정확도를 위해 권장됩니다",
    "garmentType.model": "모델 착용 사진",
    "garmentType.flatLay": "플랫레이(옷만 촬영)",

    // Banner & Counters
    "banner.byokActive": "내 API 키 적용 중 (무제한 사용 가능)",
    "banner.removeKey": "키 제거",
    "banner.freeUses": "무료 체험:",
    "banner.usesCount": "회 사용 중",
    "banner.registerKey": "API 키 / 무제한 요금제",

    // Buttons
    "btn.generate": "가상 피팅 생성",
    "btn.generating": "AI 피팅 생성 중...",
    "btn.downloadPng": "PNG 다운로드",
    "btn.reGenerate": "다시 생성",
    "btn.changeGarment": "다른 옷 입혀보기",

    // Loading & Skeleton
    "loading.title": "AI가 옷을 입혀보는 중...",
    "loading.sub":
      "평균 15초~30초 소요됩니다. 고품질 피팅 이미지를 생성하고 있습니다.",
    "loading.rendering": "실루엣과 질감을 렌더링 중입니다",

    // Result View
    "result.title": "비포 / 애프터 피팅 비교",
    "result.badge": "가상 피팅 완성!",
    "result.sub": "왼쪽 원본 사진과 오른쪽 AI 가상 피팅 착용 샷을 비교해보세요.",
    "result.original": "원본",
    "result.tryOnResult": "가상 피팅 결과",

    // Modal
    "modal.title": "무료 체험 2회를 모두 사용했어요",
    "modal.sub":
      "FitMe 무료 피팅 기회가 소진되었습니다. 지속적인 사용을 위해 아래 옵션을 확인해 주세요.",
    "modal.optionA": "옵션 A: 내 fal.ai API 키 사용 (무제한)",
    "modal.optionADesc":
      "본인의 fal.ai API 키를 입력하시면 횟수 제한 없이 계속 가상 피팅을 이용할 수 있습니다.",
    "modal.placeholder": "fal.ai API Key 입력 (예: 107bdf83...)",
    "modal.saveBtn": "키 저장 후 계속 이용하기",
    "modal.privacyNote":
      "입력하신 API 키는 브라우저(localStorage)에만 안전하게 저장되며, 고객님의 개인 피팅 요청 시에만 사용됩니다. 서버에 저장되거나 수집되지 않습니다.",
    "modal.optionB": "옵션 B: 정식 무제한 멤버십 결제",
    "modal.optionBDesc": "원하시는 결제 수단을 선택하여 무제한 이용 권한을 구독하세요.",

    // Payments
    "payment.tossBtn": "토스페이먼츠 결제 (카드/간편결제)",
    "payment.stripeEnBtn": "Stripe 결제 (Apple Pay / Credit Card)",
    "payment.stripeJaBtn": "Stripe 決済 (PayPay / コンビニ / カード)",
    "payment.paypalBtn": "PayPal 결제",
    "payment.or": "또는",
    "payment.successTitle": "결제가 성공적으로 완료되었습니다!",
    "payment.successSub": "FitMe 무제한 가상 피팅 이용 권한이 활성화되었습니다.",
    "payment.orderId": "주문 번호:",
    "payment.backToStudio": "가상 피팅룸으로 돌아가기",
    "payment.cancelTitle": "결제가 취소되었습니다",
    "payment.cancelSub": "결제가 완료되지 않았습니다. 언제든지 다시 시도해 주실 수 있습니다.",
    "payment.retryBtn": "다시 결제하기",

    // Error Messages & Server Error Codes
    ERR_INVALID_TYPE: "이미지 파일(JPG, PNG, WEBP 등)만 업로드 가능합니다.",
    ERR_FILE_TOO_LARGE: "파일 크기는 8MB 이하만 업로드 가능합니다.",
    ERR_READ_FILE: "파일을 읽는 중 오류가 발생했습니다. 다시 시도해주세요.",
    ERR_NO_KEY: "사용 가능한 FAL API 키가 없습니다. 본인의 API 키를 입력해 주세요.",
    ERR_NO_IMAGES: "내 사진과 옷 사진을 모두 업로드해야 합니다.",
    ERR_UPLOAD_FAILED: "이미지 저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
    ERR_GENERATE_FAILED: "피팅 이미지를 생성하지 못했습니다. 다시 시도해 주세요.",
    ERR_SERVER_ERROR:
      "가상 피팅 처리 중 오류가 발생했습니다. 이미지 및 네트워크 상태를 확인해 주세요.",

    // Footer
    "footer.brand": "FitMe — AI Virtual Try-On",
    "footer.copyright": "FitMe. All rights reserved.",
  },
  ja: {
    // App & Header
    "app.title": "FitMe",
    "app.subtitle": "AI Virtual Try-On",
    "nav.tryOn": "バーチャル試着を開始",

    // Hero Section
    "hero.badge": "次世代AIバーチャル試着サービス",
    "hero.headline1": "服の写真1枚で ",
    "hero.headline2": "自分が着た姿",
    "hero.headline3": "を確認",
    "hero.subheadline":
      "ECサイトのお気に入りの服をキャプチャし、ご自身の写真と一緒にアップロードするだけで、AIが自然な試着カットを生成します。",
    "hero.cta": "バーチャル試着する",

    // How It Works
    "howItWorks.tag": "HOW IT WORKS",
    "howItWorks.title": "FitMeの使い方 簡単3ステップ",
    "howItWorks.step1Title": "1. 自分の写真をアップロード",
    "howItWorks.step1Desc":
      "全身または上半身がはっきりと写ったご自身の写真をアップロードします。",
    "howItWorks.step2Title": "2. 試着したい服を選択",
    "howItWorks.step2Desc":
      "ECサイトのキャプチャ画像や服単体の写真を自由にアップロードしてください。",
    "howItWorks.step3Title": "3. AIバーチャル試着を確認",
    "howItWorks.step3Desc":
      "AIが体型や服の質感を計算し、リアルな着用カットを生成します。",

    // Uploader Component
    "uploader.tag": "AIバーチャル試着スタジオ",
    "uploader.title": "2枚の写真で完成するバーチャル試着",
    "uploader.subtitle":
      "ご自身の写真と着てみたい服の写真をアップロードしてください。",
    "uploader.userImageLabel": "1. 自分の写真",
    "uploader.garmentImageLabel": "2. 服の写真",
    "uploader.required": "(必須)",
    "uploader.maxSize": "最大8MB",
    "uploader.userDropzoneText": "自分の写真をドラッグ＆ドロップまたはクリック",
    "uploader.userDropzoneSub":
      "全身または上半身がよく見える写真をおすすめします",
    "uploader.garmentDropzoneText": "服の写真を作ドラッグ＆ドロップまたはクリック",
    "uploader.garmentDropzoneSub":
      "ECサイトのキャプチャ、モデル着用画像、服単体画像すべて可能",
    "uploader.hint":
      "自分の写真と服の写真の両方を選択するとボタンが有効化されます。",

    // Garment Type
    "garmentType.title": "衣装写真の種類を選択",
    "garmentType.sub": "試着の精度向上のため推奨されます",
    "garmentType.model": "モデル着用写真",
    "garmentType.flatLay": "平置き(服のみ撮影)",

    // Banner & Counters
    "banner.byokActive": "マイAPIキー適用中 (無制限利用可能)",
    "banner.removeKey": "キー削除",
    "banner.freeUses": "無料体験:",
    "banner.usesCount": "回利用中",
    "banner.registerKey": "APIキー / 無制限プラン",

    // Buttons
    "btn.generate": "バーチャル試着を生成",
    "btn.generating": "AI試着を生成中...",
    "btn.downloadPng": "PNGダウンロード",
    "btn.reGenerate": "再生成",
    "btn.changeGarment": "別の服を試着",

    // Loading & Skeleton
    "loading.title": "AIが服を試着させています...",
    "loading.sub":
      "平均15秒〜30秒かかります。高品質な試着画像を生成しています。",
    "loading.rendering": "シルエットと質感をレンダリング中...",

    // Result View
    "result.title": "ビフォー / アフター試着比較",
    "result.badge": "バーチャル試着完成！",
    "result.sub":
      "左側の元の写真と右側のAIバーチャル試着画像を比較してみてください。",
    "result.original": "元の写真",
    "result.tryOnResult": "バーチャル試着結果",

    // Modal
    "modal.title": "無料体験2回を使い切りました",
    "modal.sub":
      "FitMeの無料試着枠を使い切りました。継続してご利用いただくには以下のオプションをご確認ください。",
    "modal.optionA": "オプション A: マイ fal.ai APIキーを使用 (無制限)",
    "modal.optionADesc":
      "ご自身のfal.ai APIキーを入力すると、回数制限なしで継続してご利用いただけます。",
    "modal.placeholder": "fal.ai API Keyを入力 (例: 107bdf83...)",
    "modal.saveBtn": "キーを保存して継続利用",
    "modal.privacyNote":
      "入力されたAPIキーはブラウザ(localStorage)にのみ安全に保存され、個人の試着リクエスト時のみ使用されます。サーバーには保存されません。",
    "modal.optionB": "オプション B: 無制限メンバーシップ決済",
    "modal.optionBDesc": "お好みの決済方法を選択して無制限アクセスをご利用ください。",

    // Payments
    "payment.tossBtn": "Toss Payments 決済 (韓国向け)",
    "payment.stripeEnBtn": "Stripe 決済 (Apple Pay / カード)",
    "payment.stripeJaBtn": "Stripe 決済 (PayPay / コンビニ / カード)",
    "payment.paypalBtn": "PayPal 決済",
    "payment.or": "または",
    "payment.successTitle": "決済が正常に完了しました！",
    "payment.successSub": "FitMe無制限バーチャル試着の利用権限が有効化されました。",
    "payment.orderId": "注文番号:",
    "payment.backToStudio": "バーチャル試着室に戻る",
    "payment.cancelTitle": "決済がキャンセルされました",
    "payment.cancelSub": "決済が完了しませんでした。いつでも再試行いただけます。",
    "payment.retryBtn": "再決済する",

    // Error Messages & Server Error Codes
    ERR_INVALID_TYPE: "画像ファイル(JPG, PNG, WEBPなど)のみアップロード可能です。",
    ERR_FILE_TOO_LARGE: "ファイルサイズは8MB以下のみアップロード可能です。",
    ERR_READ_FILE: "ファイルの読み込み中にエラーが発生しました。再試行してください。",
    ERR_NO_KEY: "利用可能なFAL APIキーがありません。APIキーを入力してください。",
    ERR_NO_IMAGES: "自分の写真と服の写真の両方をアップロードする必要があります。",
    ERR_UPLOAD_FAILED: "画像の保存中にエラーが発生しました。再試行してください。",
    ERR_GENERATE_FAILED: "試着画像を生成できませんでした。再試行してください。",
    ERR_SERVER_ERROR:
      "バーチャル試着処理中にエラーが発生しました。画像およびネットワーク状態をご確認ください。",

    // Footer
    "footer.brand": "FitMe — AI Virtual Try-On",
    "footer.copyright": "FitMe. All rights reserved.",
  },
  en: {
    // App & Header
    "app.title": "FitMe",
    "app.subtitle": "AI Virtual Try-On",
    "nav.tryOn": "Start Virtual Try-On",

    // Hero Section
    "hero.badge": "Next-Gen AI Virtual Try-On Service",
    "hero.headline1": "See Yourself Wearing ",
    "hero.headline2": "Any Clothes",
    "hero.headline3": " Instantly",
    "hero.subheadline":
      "Snap a photo of any outfit from an online store and upload your photo. AI will create realistic try-on results.",
    "hero.cta": "Try It On Virtually",

    // How It Works
    "howItWorks.tag": "HOW IT WORKS",
    "howItWorks.title": "3 Simple Steps to Use FitMe",
    "howItWorks.step1Title": "1. Upload Your Photo",
    "howItWorks.step1Desc":
      "Upload a clear full-body or half-body photo of yourself.",
    "howItWorks.step2Title": "2. Choose Clothing",
    "howItWorks.step2Desc":
      "Upload a screenshot from a store or a flat-lay photo of the item.",
    "howItWorks.step3Title": "3. View AI Try-On Result",
    "howItWorks.step3Desc":
      "AI calculates body pose and garment textures to generate a realistic try-on photo.",

    // Uploader Component
    "uploader.tag": "AI Virtual Try-On Studio",
    "uploader.title": "Virtual Try-On in Two Photos",
    "uploader.subtitle": "Upload your photo and the photo of the clothing item.",
    "uploader.userImageLabel": "1. My Photo",
    "uploader.garmentImageLabel": "2. Garment Photo",
    "uploader.required": "(Required)",
    "uploader.maxSize": "Max 8MB",
    "uploader.userDropzoneText": "Drag & drop or click to upload your photo",
    "uploader.userDropzoneSub": "Full-body or half-body photo recommended",
    "uploader.garmentDropzoneText": "Drag & drop or click to upload garment photo",
    "uploader.garmentDropzoneSub":
      "Screenshots, model shots, or flat-lay photos all welcome",
    "uploader.hint": "Select both photos to enable the button.",

    // Garment Type
    "garmentType.title": "Select Garment Photo Type",
    "garmentType.sub": "Recommended for higher try-on accuracy",
    "garmentType.model": "Model Photo",
    "garmentType.flatLay": "Flat-Lay (Item Only)",

    // Banner & Counters
    "banner.byokActive": "Using My API Key (Unlimited)",
    "banner.removeKey": "Remove Key",
    "banner.freeUses": "Free Demo:",
    "banner.usesCount": "used",
    "banner.registerKey": "API Key / Unlimited Plan",

    // Buttons
    "btn.generate": "Generate Virtual Try-On",
    "btn.generating": "Generating Try-On...",
    "btn.downloadPng": "Download PNG",
    "btn.reGenerate": "Regenerate",
    "btn.changeGarment": "Try Another Garment",

    // Loading & Skeleton
    "loading.title": "AI is dressing your photo...",
    "loading.sub":
      "Takes about 15–30 seconds. Generating high-quality try-on image.",
    "loading.rendering": "Rendering silhouette and texture...",

    // Result View
    "result.title": "Before / After Comparison",
    "result.badge": "Try-On Complete!",
    "result.sub":
      "Compare your original photo on the left with the AI try-on result on the right.",
    "result.original": "Original",
    "result.tryOnResult": "Virtual Try-On Result",

    // Modal
    "modal.title": "Free Demo Limit Reached (2 Uses)",
    "modal.sub":
      "Your free demo tries have been used up. Please choose an option below to continue.",
    "modal.optionA": "Option A: Use My Own fal.ai API Key (Unlimited)",
    "modal.optionADesc":
      "Enter your own fal.ai API key to enjoy unlimited virtual try-ons.",
    "modal.placeholder": "Enter fal.ai API Key (e.g. 107bdf83...)",
    "modal.saveBtn": "Save Key & Continue",
    "modal.privacyNote":
      "Your API key is safely stored only in your browser (localStorage) and is used solely for your own requests. It is never logged or stored on our servers.",
    "modal.optionB": "Option B: Unlimited Membership Plan",
    "modal.optionBDesc": "Select a payment method below for unlimited access.",

    // Payments
    "payment.tossBtn": "Toss Payments (Cards / Easy Pay)",
    "payment.stripeEnBtn": "Stripe Checkout (Apple Pay / Google Pay / Cards)",
    "payment.stripeJaBtn": "Stripe (PayPay / Konbini / Cards)",
    "payment.paypalBtn": "PayPal Checkout",
    "payment.or": "or",
    "payment.successTitle": "Payment Successful!",
    "payment.successSub": "Your unlimited FitMe virtual try-on access is now active.",
    "payment.orderId": "Order ID:",
    "payment.backToStudio": "Return to Try-On Studio",
    "payment.cancelTitle": "Payment Cancelled",
    "payment.cancelSub": "The payment was not completed. You can try again anytime.",
    "payment.retryBtn": "Retry Payment",

    // Error Messages & Server Error Codes
    ERR_INVALID_TYPE: "Only image files (JPG, PNG, WEBP, etc.) are allowed.",
    ERR_FILE_TOO_LARGE: "File size must be under 8MB.",
    ERR_READ_FILE: "Error reading file. Please try again.",
    ERR_NO_KEY: "No FAL API key available. Please enter your API key.",
    ERR_NO_IMAGES: "Both person photo and garment photo are required.",
    ERR_UPLOAD_FAILED: "Error uploading images. Please try again.",
    ERR_GENERATE_FAILED: "Failed to generate try-on image. Please try again.",
    ERR_SERVER_ERROR:
      "Error processing virtual try-on. Please check images and network connection.",

    // Footer
    "footer.brand": "FitMe — AI Virtual Try-On",
    "footer.copyright": "FitMe. All rights reserved.",
  },
};
