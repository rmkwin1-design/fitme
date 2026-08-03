import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "ko";

  let title = "옷 사진 한 장으로 내가 입은 모습을 확인하세요";
  let sub = "FitMe — AI 기반 가상 피팅 스튜디오";

  if (lang === "ja") {
    title = "服の写真1枚で自分が着た姿を確認";
    sub = "FitMe — AIバーチャル試着スタジオ";
  } else if (lang === "en") {
    title = "See Yourself Wearing Any Clothes Instantly";
    sub = "FitMe — AI Virtual Try-On Studio";
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #ffffff, #eef2ff, #f3e8ff)",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 36,
            fontWeight: "bold",
            color: "#4f46e5",
            marginBottom: 24,
          }}
        >
          <span>👕 FitMe AI</span>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#0f172a",
            maxWidth: 950,
            lineHeight: 1.25,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          {sub}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
