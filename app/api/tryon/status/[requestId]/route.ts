import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

// Image Post-Processing Enhancement Configurations (Configurable Constants)
const ENHANCE_CONFIG = {
  sharpen: { sigma: 1.2, m1: 1.0, m2: 2.0 },
  modulate: { brightness: 1.03, saturation: 1.08 },
  linearMultiplier: 1.05,
  linearOffset: -8,
  gamma: 1.05,
};

interface FalApiError {
  body?: {
    detail?: string | Array<{ msg?: string }>;
  };
  message?: string;
}

export async function GET(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const requestId = params.requestId;

    if (!requestId) {
      return NextResponse.json(
        { errorCode: "ERR_INVALID_REQUEST", error: "요청 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const userKey = req.headers.get("x-fal-key")?.trim();
    const falKey = userKey || process.env.FAL_KEY;

    if (!falKey) {
      return NextResponse.json(
        { errorCode: "ERR_NO_KEY", error: "사용 가능한 FAL API 키가 없습니다." },
        { status: 401 }
      );
    }

    fal.config({ credentials: falKey });

    console.log(`[TryOn Status API] Checking queue status for requestId: ${requestId}`);

    const status = await fal.queue.status("fal-ai/fashn/tryon/v1.6", {
      requestId,
      logs: true,
    });

    const currentStatus = String(status.status);
    console.log(`[TryOn Status API] Status for ${requestId}: ${currentStatus}`);

    if (currentStatus === "COMPLETED") {
      console.log(`[TryOn Status API] Queue completed. Fetching result for ${requestId}...`);
      try {
        const result = (await fal.queue.result("fal-ai/fashn/tryon/v1.6", {
          requestId,
        })) as {
          data?: { images?: Array<{ url: string }> };
          images?: Array<{ url: string }>;
        };

        const rawImageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;

        if (!rawImageUrl) {
          console.error(`[TryOn Status API] Completed status but no image URL found for ${requestId}`, result);
          return NextResponse.json(
            { errorCode: "ERR_GENERATE_FAILED", error: "결과 이미지를 수신하지 못했습니다." },
            { status: 500 }
          );
        }

        console.log(`[TryOn Status API] Downloading raw image for sharp post-processing enhancement: ${rawImageUrl}`);

        let finalImageUrl = rawImageUrl;

        try {
          const imgResp = await fetch(rawImageUrl);
          if (imgResp.ok) {
            const rawArrayBuffer = await imgResp.arrayBuffer();
            const rawBuffer = Buffer.from(rawArrayBuffer);

            // Apply sharp post-processing quality enhancement pipeline
            const enhancedBuffer = await sharp(rawBuffer)
              .sharpen(ENHANCE_CONFIG.sharpen)
              .modulate(ENHANCE_CONFIG.modulate)
              .linear(ENHANCE_CONFIG.linearMultiplier, ENHANCE_CONFIG.linearOffset)
              .gamma(ENHANCE_CONFIG.gamma)
              .png()
              .toBuffer();

            const uint8Array = new Uint8Array(enhancedBuffer);
            const enhancedFile = new File([uint8Array], "fitme-result-enhanced.png", { type: "image/png" });
            const uploadRes = await fal.storage.upload(enhancedFile);
            finalImageUrl = typeof uploadRes === "string" ? uploadRes : (uploadRes as { url?: string })?.url || rawImageUrl;

            console.log(`[TryOn Status API] Post-processing enhancement successful! Enhanced URL: ${finalImageUrl}`);
          }
        } catch (enhanceErr) {
          console.warn("[TryOn Status API] Sharp post-processing enhancement warning, using raw URL:", enhanceErr);
          finalImageUrl = rawImageUrl;
        }

        return NextResponse.json({ status: "COMPLETED", imageUrl: finalImageUrl });
      } catch (resultErr: unknown) {
        const falErr = resultErr as FalApiError;
        const detail = falErr?.body?.detail;
        const rawMsg =
          Array.isArray(detail) && detail[0]?.msg
            ? detail[0].msg
            : typeof detail === "string"
            ? detail
            : falErr?.message || String(resultErr);

        console.error(`[TryOn Status API] Model Result Error for ${requestId}:`, rawMsg);

        if (typeof rawMsg === "string" && rawMsg.includes("Failed to detect body pose")) {
          return NextResponse.json(
            {
              status: "FAILED",
              errorCode: "ERR_NO_POSE",
              error: "내 사진에서 사람의 신체 포즈가 감지되지 않았습니다. 사람 전신/상반신이 잘 나온 사진을 올려주세요."
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            status: "FAILED",
            errorCode: "ERR_GENERATE_FAILED",
            error: typeof rawMsg === "string" ? rawMsg : "피팅 이미지 생성에 실패했습니다."
          },
          { status: 500 }
        );
      }
    }

    if (currentStatus === "FAILED" || currentStatus === "ERROR") {
      console.error(`[TryOn Status API] Queue status returned ${currentStatus} for ${requestId}`);
      return NextResponse.json(
        {
          status: "FAILED",
          errorCode: "ERR_GENERATE_FAILED",
          error: "가상 피팅 생성이 실패했습니다."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: currentStatus });
  } catch (err: unknown) {
    const falErr = err as FalApiError;
    const detail = falErr?.body?.detail;
    const errorMsg =
      Array.isArray(detail) && detail[0]?.msg
        ? detail[0].msg
        : typeof detail === "string"
        ? detail
        : falErr?.message || String(err);

    console.error(`[TryOn Status API Outer Catch Error] requestId: ${params.requestId}:`, errorMsg);
    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: typeof errorMsg === "string" ? errorMsg : "상태 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
