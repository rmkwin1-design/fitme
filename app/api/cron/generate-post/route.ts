import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const secretParam = searchParams.get("secret");

    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secretParam !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const repoOwner = "rmkwin1-design";
    const repoName = "fitme";

    const timestamp = Date.now();
    const dateStr = new Date().toISOString().split("T")[0];
    const slug = `ai-style-guide-${timestamp}`;

    const locales = ["ko", "ja", "en"];
    const createdPosts: string[] = [];

    const topicPrompts: Record<string, { title: string; desc: string; body: string }> = {
      ko: {
        title: `AI 피팅으로 만드는 주간 스마트 코디 가이드 (${dateStr})`,
        desc: "쇼핑 실패를 줄여주는 AI 가상 착용 팁과 이번 주 트렌디 스타일 추천 가이드입니다.",
        body: `# AI 피팅으로 만드는 주간 스마트 코디 가이드\n\n온라인에서 마음에 드는 의상을 캡처하여 FitMe AI에 업로드해보세요.\n\n## 💡 이 주의 스타일링 팁\n1. 상반신이 또렷한 정면 사진을 준비합니다.\n2. 입어보고 싶은 셔츠, 자켓, 아우터 이미지를 캡처합니다.\n3. FitMe AI 가상 피팅으로 실시간 착용 샷을 확인하세요.\n\n[👉 지금 바로 FitMe에서 무료로 옷 입혀보기](/)`,
      },
      ja: {
        title: `AIバーチャルフィッティングで作る今週のスマートコーデ (${dateStr})`,
        desc: "オンラインショッピングの失敗をなくすAI試着のコツとおすすめスタイルです。",
        body: `# AIバーチャルフィッティングで作る今週のスマートコーデ\n\n通販サイトでお気に入りの服をキャプチャしてFitMe AIにアップロードしましょう。\n\n## 💡 今週のスタイリングのコツ\n1. 正面から撮ったクリアな写真を用意します。\n2. 試着したい服の画像を準備します。\n3. FitMe AIで即座に試着結果を確認できます。\n\n[👉 FitMeで今すぐ無料で試着してみる](/)`,
      },
      en: {
        title: `Weekly Smart Styling Guide with AI Virtual Try-On (${dateStr})`,
        desc: "Discover how AI virtual try-on eliminates online fashion sizing uncertainty.",
        body: `# Weekly Smart Styling Guide with AI Virtual Try-On\n\nCapture your favorite items online and preview them instantly on your own photo using FitMe AI.\n\n## 💡 Weekly Outfit Preview Tips\n1. Upload a clear well-lit torso photo.\n2. Choose any shirt, jacket, or coat from any store.\n3. See your AI try-on preview in seconds.\n\n[👉 Try On Clothes For Free Now on FitMe](/)`,
      },
    };

    for (const loc of locales) {
      const topic = topicPrompts[loc];
      const mdxContent = `---
title: "${topic.title}"
description: "${topic.desc}"
date: "${dateStr}"
draft: true
locale: "${loc}"
slug: "${slug}"
---

${topic.body}
`;

      const filePath = `content/${loc}/${slug}.mdx`;

      if (githubToken) {
        const base64Content = Buffer.from(mdxContent, "utf-8").toString("base64");
        const ghApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

        const res = await fetch(ghApiUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `cron(seo): Auto-generate weekly blog draft for [${loc}] - ${slug}`,
            content: base64Content,
            branch: "main",
          }),
        });

        if (res.ok) {
          createdPosts.push(filePath);
        } else {
          console.error(`Failed to commit post to GitHub for [${loc}]:`, await res.text());
        }
      } else {
        console.log(`[Cron Dry Run - No GITHUB_TOKEN] Prepared post for ${filePath}`);
        createdPosts.push(`${filePath} (dry-run)`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Weekly AI blog posts generated with draft: true",
      posts: createdPosts,
    });
  } catch (err: unknown) {
    console.error("[Cron Post Generation Failure]:", err);
    return NextResponse.json(
      { error: "Failed to generate weekly blog post" },
      { status: 500 }
    );
  }
}
