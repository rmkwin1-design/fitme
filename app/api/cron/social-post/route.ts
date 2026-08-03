import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SocialLogEntry {
  id: string;
  timestamp: string;
  platform: string;
  locale: string;
  caption: string;
  imageUrl: string;
  status: "SUCCESS" | "DRY_RUN" | "FAILED";
  details?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const secretParam = searchParams.get("secret");

    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secretParam !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized social cron trigger" }, { status: 401 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fitme-nu-woad.vercel.app";
    const demoImageUrl = `${siteUrl}/api/og?lang=ko`;
    const timestamp = new Date().toISOString();

    // 1. Generate Platform & Locale specific promotional captions
    const captions = {
      ko: `👔 쇼핑몰 옷, 사기 전에 미리 입어보세요!
사진 2장이면 AI가 내 몸에 꼭 맞춘 피팅컷을 만들어 드립니다 ✨

👉 무료 체험하기: ${siteUrl}

#FitMe #AI가상피팅 #쇼핑꿀팁 #OOTD #패션AI #AI피팅룸`,

      ja: `👔 ネット通販の服、買う前に自分で着画をプレビュー！
写真2枚でAIが自然なバーチャル試着画像を生成します ✨

👉 無料で試着してみる: ${siteUrl}

#FitMe #AI試着 #ファッション #ネット通販 #バーチャルフィッティング`,

      en: `👔 Stop guessing if clothes will fit you online!
FitMe AI lets you visualize any garment on your own photo in seconds 🚀

👉 Try On For Free: ${siteUrl}

#AI #VirtualTryOn #FashionTech #ProductHunt #OutfitPlanner`,
    };

    const logs: SocialLogEntry[] = [];

    // 2. Post to X (Twitter) via API v2
    const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (twitterBearerToken) {
      try {
        const res = await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${twitterBearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: captions.en,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          logs.push({
            id: `x-${Date.now()}`,
            timestamp,
            platform: "X (Twitter)",
            locale: "en",
            caption: captions.en,
            imageUrl: demoImageUrl,
            status: "SUCCESS",
            details: JSON.stringify(resData),
          });
        } else {
          const errText = await res.text();
          logs.push({
            id: `x-${Date.now()}`,
            timestamp,
            platform: "X (Twitter)",
            locale: "en",
            caption: captions.en,
            imageUrl: demoImageUrl,
            status: "FAILED",
            details: `HTTP ${res.status}: ${errText}`,
          });
        }
      } catch (err: unknown) {
        logs.push({
          id: `x-${Date.now()}`,
          timestamp,
          platform: "X (Twitter)",
          locale: "en",
          caption: captions.en,
          imageUrl: demoImageUrl,
          status: "FAILED",
          details: String(err),
        });
      }
    } else {
      logs.push({
        id: `x-${Date.now()}`,
        timestamp,
        platform: "X (Twitter)",
        locale: "en",
        caption: captions.en,
        imageUrl: demoImageUrl,
        status: "DRY_RUN",
        details: "Missing TWITTER_BEARER_TOKEN in env vars",
      });
    }

    // 3. Post to Instagram Graph API
    const igAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_USER_ID;

    if (igAccessToken && igUserId) {
      try {
        // Step A: Create Container
        const containerRes = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: demoImageUrl,
            caption: captions.ko,
            access_token: igAccessToken,
          }),
        });

        const containerData = await containerRes.json();

        if (containerData.id) {
          // Step B: Publish Container
          const publishRes = await fetch(`https://graph.facebook.com/v18.0/${igUserId}/media_publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: igAccessToken,
            }),
          });

          const publishData = await publishRes.json();

          if (publishData.id) {
            logs.push({
              id: `ig-${Date.now()}`,
              timestamp,
              platform: "Instagram",
              locale: "ko",
              caption: captions.ko,
              imageUrl: demoImageUrl,
              status: "SUCCESS",
              details: `Published Post ID: ${publishData.id}`,
            });
          } else {
            logs.push({
              id: `ig-${Date.now()}`,
              timestamp,
              platform: "Instagram",
              locale: "ko",
              caption: captions.ko,
              imageUrl: demoImageUrl,
              status: "FAILED",
              details: JSON.stringify(publishData),
            });
          }
        } else {
          logs.push({
            id: `ig-${Date.now()}`,
            timestamp,
            platform: "Instagram",
            locale: "ko",
            caption: captions.ko,
            imageUrl: demoImageUrl,
            status: "FAILED",
            details: JSON.stringify(containerData),
          });
        }
      } catch (err: unknown) {
        logs.push({
          id: `ig-${Date.now()}`,
          timestamp,
          platform: "Instagram",
          locale: "ko",
          caption: captions.ko,
          imageUrl: demoImageUrl,
          status: "FAILED",
          details: String(err),
        });
      }
    } else {
      logs.push({
        id: `ig-${Date.now()}`,
        timestamp,
        platform: "Instagram",
        locale: "ko",
        caption: captions.ko,
        imageUrl: demoImageUrl,
        status: "DRY_RUN",
        details: "Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID in env vars",
      });
    }

    // 4. Optionally commit social posting logs to GitHub repository if GITHUB_TOKEN exists
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (githubToken) {
      try {
        const repoOwner = "rmkwin1-design";
        const repoName = "fitme";
        const logPath = "data/social-posts-log.json";
        const ghApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${logPath}`;

        let existingLogs: SocialLogEntry[] = [];
        let sha: string | undefined = undefined;

        // Check if log file exists in GitHub
        const getRes = await fetch(ghApiUrl, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
          const contentStr = Buffer.from(fileData.content, "base64").toString("utf-8");
          existingLogs = JSON.parse(contentStr);
        }

        const updatedLogs = [...logs, ...existingLogs].slice(0, 100);
        const updatedBase64 = Buffer.from(JSON.stringify(updatedLogs, null, 2), "utf-8").toString("base64");

        await fetch(ghApiUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `cron(social): Log auto-posting run at ${timestamp}`,
            content: updatedBase64,
            sha,
            branch: "main",
          }),
        });
      } catch (logErr) {
        console.error("Failed to commit social post logs to GitHub:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp,
      logs,
    });
  } catch (err: unknown) {
    console.error("[Social Post Cron Failure]:", err);
    return NextResponse.json(
      { error: "Failed to execute social media auto-post" },
      { status: 500 }
    );
  }
}
