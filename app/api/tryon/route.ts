import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { personImageBase64, garmentImageBase64, garmentPhotoType } = await req.json();
    if (!personImageBase64 || !garmentImageBase64) {
      return NextResponse.json(
        { errorCode: "ERR_NO_IMAGES", error: "사진 두 장이 모두 필요합니다." },
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

    const toBlob = (b64: string): Blob => {
      const raw = b64.replace(/^data:image\/\w+;base64,/, "");
      return new Blob([Buffer.from(raw, "base64")], { type: "image/jpeg" });
    };

    const [personUrlRes, garmentUrlRes] = await Promise.all([
      fal.storage.upload(toBlob(personImageBase64)),
      fal.storage.upload(toBlob(garmentImageBase64)),
    ]);

    const personUrl =
      typeof personUrlRes === "string"
        ? personUrlRes
        : (personUrlRes as { url?: string })?.url;
    const garmentUrl =
      typeof garmentUrlRes === "string"
        ? garmentUrlRes
        : (garmentUrlRes as { url?: string })?.url;

    if (!personUrl || !garmentUrl) {
      return NextResponse.json(
        { errorCode: "ERR_UPLOAD_FAILED", error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    const result = (await fal.subscribe("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: personUrl,
        garment_image: garmentUrl,
        garment_photo_type: garmentPhotoType || "model",
        mode: "balanced",
      },
    })) as {
      data?: { images?: Array<{ url: string }> };
      images?: Array<{ url: string }>;
    };

    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { errorCode: "ERR_GENERATE_FAILED", error: "이미지 생성에 실패했습니다. 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    console.error("TryOn Serverless Route Error:", err);
    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
