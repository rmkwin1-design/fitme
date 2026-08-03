import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    console.log(`[TryOn Status API] Checking status for requestId: ${requestId}`);

    const status = await fal.queue.status("fal-ai/fashn/tryon/v1.6", {
      requestId,
      logs: true,
    });

    console.log(`[TryOn Status API] Status for ${requestId}: ${status.status}`);

    if (status.status === "COMPLETED") {
      console.log(`[TryOn Status API] Fetching result for ${requestId}...`);
      const result = (await fal.queue.result("fal-ai/fashn/tryon/v1.6", {
        requestId,
      })) as {
        data?: { images?: Array<{ url: string }> };
        images?: Array<{ url: string }>;
      };

      const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;

      if (!imageUrl) {
        console.error(`[TryOn Status API] Completed status but no image URL for ${requestId}`, result);
        return NextResponse.json(
          { errorCode: "ERR_GENERATE_FAILED", error: "결과 이미지를 수신하지 못했습니다." },
          { status: 500 }
        );
      }

      console.log(`[TryOn Status API] Success! Retrieved result image URL for ${requestId}: ${imageUrl}`);
      return NextResponse.json({ status: "COMPLETED", imageUrl });
    }

    return NextResponse.json({ status: status.status });
  } catch (err: unknown) {
    const falErr = err as FalApiError;
    const detail = falErr?.body?.detail;
    const errorMsg =
      Array.isArray(detail) && detail[0]?.msg
        ? detail[0].msg
        : typeof detail === "string"
        ? detail
        : falErr?.message || String(err);

    console.error(`[TryOn Status API Failure] requestId: ${params.requestId}:`, errorMsg);
    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: typeof errorMsg === "string" ? errorMsg : "상태 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
